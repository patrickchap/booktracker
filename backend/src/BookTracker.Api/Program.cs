using System.Net;
using System.Text;
using System.Text.Json;
using System.Threading.RateLimiting;
using BookTracker.Application.Interfaces;
using Microsoft.AspNetCore.RateLimiting;
using BookTracker.Application.Services;
using BookTracker.Infrastructure.Caching;
using BookTracker.Infrastructure.Data;
using BookTracker.Infrastructure.Repositories;
using BookTracker.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Load local configuration if it exists (not committed to source control)
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

// Add DbContext
builder.Services.AddDbContext<BookTrackerDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSQL"),
        b => b.MigrationsAssembly("BookTracker.Infrastructure")));

// Add Redis Cache
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "BookTracker:";
});

// Add Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSecret = builder.Configuration["Authentication:Jwt:Secret"]
            ?? throw new InvalidOperationException("JWT secret not configured");

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Authentication:Jwt:Issuer"] ?? "BookTracker",
            ValidAudience = builder.Configuration["Authentication:Jwt:Audience"] ?? "BookTracker",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

// Register Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserBookRepository, UserBookRepository>();

// Register Services
builder.Services.AddScoped<ICacheService, RedisCacheService>();
builder.Services.AddScoped<ILibraryService, LibraryService>();

// Register HttpClient for GoogleBooksService
builder.Services.AddHttpClient<IGoogleBooksService, GoogleBooksService>();

builder.Services.AddScoped<IAuthService, AuthService>();

// Add Controllers
builder.Services.AddControllers();

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Add Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Strict limit for auth endpoints (prevent brute force)
    options.AddFixedWindowLimiter("auth", policy =>
    {
        policy.PermitLimit = 10;
        policy.Window = TimeSpan.FromMinutes(1);
    });

    // Moderate limit for external API calls (Google Books)
    options.AddTokenBucketLimiter("external-api", policy =>
    {
        policy.TokenLimit = 30;
        policy.ReplenishmentPeriod = TimeSpan.FromMinutes(1);
        policy.TokensPerPeriod = 10;
    });

    // General limit for authenticated endpoints
    options.AddSlidingWindowLimiter("general", policy =>
    {
        policy.PermitLimit = 100;
        policy.Window = TimeSpan.FromMinutes(1);
        policy.SegmentsPerWindow = 4;
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler(errApp =>
{
    errApp.Run(async context =>
    {
        var feature = context.Features.Get<IExceptionHandlerFeature>();
        var ex = feature?.Error;

        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        if (ex is not null)
            logger.LogError(ex, "Unhandled exception occurred for {Method} {Path}", context.Request.Method, context.Request.Path);

        var (statusCode, message) = ex switch
        {
            HttpRequestException httpEx => (
                (int)(httpEx.StatusCode ?? HttpStatusCode.BadGateway),
                "An upstream service error occurred. Please try again later."),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred.")
        };

        // Clamp non-5xx upstream codes (e.g. 404 from Google Books) to 502
        if (statusCode is >= 200 and < 500)
            statusCode = StatusCodes.Status502BadGateway;

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(
            JsonSerializer.Serialize(new { message }));
    });
});

app.UseCors("AllowFrontend");
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Apply migrations automatically in development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<BookTrackerDbContext>();
    dbContext.Database.Migrate();
}

app.Run();

// Make Program class accessible for integration tests
public partial class Program { }
