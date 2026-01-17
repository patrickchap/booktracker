using System.Text;
using BookTracker.Application.Interfaces;
using BookTracker.Application.Services;
using BookTracker.Infrastructure.Caching;
using BookTracker.Infrastructure.Data;
using BookTracker.Infrastructure.Repositories;
using BookTracker.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
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

// Register HttpClient for AuthService
builder.Services.AddHttpClient<IAuthService, AuthService>();

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

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

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
