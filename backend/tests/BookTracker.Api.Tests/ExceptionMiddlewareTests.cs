using System.Net;
using System.Text.Json;
using BookTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace BookTracker.Api.Tests;

public class ExceptionMiddlewareTests : IClassFixture<ExceptionTestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ExceptionMiddlewareTests(ExceptionTestWebApplicationFactory factory)
    {
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
    }

    [Fact]
    public async Task HttpRequestException_WithStatusCode502_Returns502()
    {
        var response = await _client.GetAsync("/throw/http502");

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
        var body = await ParseBody(response);
        Assert.Contains("upstream service error", body.GetProperty("message").GetString());
    }

    [Fact]
    public async Task HttpRequestException_WithUpstream400_Returns502()
    {
        var response = await _client.GetAsync("/throw/http400");

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
    }

    [Fact]
    public async Task HttpRequestException_WithUpstream401_Returns502()
    {
        var response = await _client.GetAsync("/throw/http401");

        // Upstream 401 must be clamped to 502, not returned as 401
        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
    }

    [Fact]
    public async Task HttpRequestException_WithNoStatusCode_Returns502()
    {
        var response = await _client.GetAsync("/throw/httpnone");

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
    }

    [Fact]
    public async Task HttpRequestException_WithUpstream500_Returns500()
    {
        var response = await _client.GetAsync("/throw/http500");

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
    }

    [Fact]
    public async Task UnauthorizedAccessException_Returns401()
    {
        var response = await _client.GetAsync("/throw/unauthorized");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        var body = await ParseBody(response);
        Assert.Equal("Unauthorized.", body.GetProperty("message").GetString());
    }

    [Fact]
    public async Task InvalidOperationException_Returns400WithMessage()
    {
        var response = await _client.GetAsync("/throw/invalidop");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await ParseBody(response);
        Assert.Contains("Book already exists in library", body.GetProperty("message").GetString());
    }

    [Fact]
    public async Task ArgumentException_Returns400WithMessage()
    {
        var response = await _client.GetAsync("/throw/argument");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await ParseBody(response);
        Assert.Contains("Rating must be between 1 and 5", body.GetProperty("message").GetString());
    }

    [Fact]
    public async Task GenericException_Returns500()
    {
        var response = await _client.GetAsync("/throw/generic");

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        var body = await ParseBody(response);
        Assert.Equal("An unexpected error occurred.", body.GetProperty("message").GetString());
    }

    [Fact]
    public async Task ResponseContentType_IsApplicationJson()
    {
        var response = await _client.GetAsync("/throw/generic");

        Assert.Contains("application/json", response.Content.Headers.ContentType?.MediaType);
    }

    private static async Task<JsonElement> ParseBody(HttpResponseMessage response)
    {
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<JsonElement>(json);
    }
}

public class ExceptionTestWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Test");

        builder.ConfigureAppConfiguration((_, cfg) =>
        {
            cfg.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Authentication:Jwt:Secret"] = "test-secret-key-that-is-at-least-32-chars!",
                ["GoogleBooks:ApiKey"] = "test-api-key",
                ["ConnectionStrings:PostgreSQL"] = "Host=localhost;Database=nonexistent",
                ["ConnectionStrings:Redis"] = "localhost:6379,abortConnect=false",
            });
        });

        builder.ConfigureTestServices(services =>
        {
            // Replace PostgreSQL DbContext with in-memory
            var dbDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<BookTrackerDbContext>));
            if (dbDescriptor != null) services.Remove(dbDescriptor);
            services.AddDbContext<BookTrackerDbContext>(o =>
                o.UseInMemoryDatabase("ExceptionTests"));

            // Replace Redis with in-memory distributed cache
            services.RemoveAll<IDistributedCache>();
            services.AddDistributedMemoryCache();

            // Inject middleware that throws exceptions based on request path
            services.AddTransient<IStartupFilter, ThrowingEndpointsStartupFilter>();
        });
    }
}

/// <summary>
/// Startup filter that registers a throwing middleware AFTER the main pipeline
/// (including exception handler), so exceptions are caught by UseExceptionHandler.
/// </summary>
internal sealed class ThrowingEndpointsStartupFilter : IStartupFilter
{
    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next) =>
        app =>
        {
            // Register exception handler + all other middleware first
            next(app);

            // Add throwing middleware after — unmatched routes fall through to here
            app.Use(async (context, nextMiddleware) =>
            {
                var path = context.Request.Path.Value ?? "";
                if (path.StartsWith("/throw/"))
                {
                    var exType = path["/throw/".Length..];
                    throw exType switch
                    {
                        "http502" => new HttpRequestException("upstream error", null, HttpStatusCode.BadGateway),
                        "http400" => new HttpRequestException("bad request", null, HttpStatusCode.BadRequest),
                        "http401" => new HttpRequestException("upstream auth", null, HttpStatusCode.Unauthorized),
                        "httpnone" => new HttpRequestException("no status code"),
                        "http500" => new HttpRequestException("server error", null, HttpStatusCode.InternalServerError),
                        "unauthorized" => new UnauthorizedAccessException(),
                        "invalidop" => new InvalidOperationException("Book already exists in library"),
                        "argument" => new ArgumentException("Rating must be between 1 and 5"),
                        "generic" => new Exception("boom"),
                        _ => new Exception("unknown test path")
                    };
                }

                await nextMiddleware(context);
            });
        };
}
