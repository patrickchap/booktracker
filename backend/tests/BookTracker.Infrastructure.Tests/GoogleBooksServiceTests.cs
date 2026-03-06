using System.Net;
using BookTracker.Application.DTOs;
using BookTracker.Application.Interfaces;
using BookTracker.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;

namespace BookTracker.Infrastructure.Tests;

public class GoogleBooksServiceTests
{
    private readonly Mock<ICacheService> _cacheMock;
    private readonly Mock<IConfiguration> _configMock;
    private readonly Mock<ILogger<GoogleBooksService>> _loggerMock;

    public GoogleBooksServiceTests()
    {
        _cacheMock = new Mock<ICacheService>();
        _configMock = new Mock<IConfiguration>();
        _loggerMock = new Mock<ILogger<GoogleBooksService>>();

        _configMock.Setup(x => x["GoogleBooks:ApiKey"]).Returns("test-api-key");
        _configMock.Setup(x => x["GoogleBooks:BaseUrl"]).Returns("https://books-api.test");
    }

    private GoogleBooksService CreateService(HttpMessageHandler handler)
    {
        var httpClient = new HttpClient(handler);
        return new GoogleBooksService(httpClient, _cacheMock.Object, _configMock.Object, _loggerMock.Object);
    }

    /// Configure cache to always call the factory so tests exercise the HTTP logic.
    private void SetupCachePassThrough()
    {
        _cacheMock.Setup(x => x.GetOrSetAsync<BookDetailsDto>(
                It.IsAny<string>(),
                It.IsAny<Func<Task<BookDetailsDto?>>>(),
                It.IsAny<TimeSpan?>()))
            .Returns<string, Func<Task<BookDetailsDto?>>, TimeSpan?>((_, factory, _) => factory());
    }

    [Fact]
    public async Task GetBookDetailsAsync_ReturnsNull_WhenApiReturns404()
    {
        SetupCachePassThrough();
        var service = CreateService(new FakeHttpMessageHandler(new HttpResponseMessage(HttpStatusCode.NotFound)));

        var result = await service.GetBookDetailsAsync("test-id");

        Assert.Null(result);
    }

    [Fact]
    public async Task GetBookDetailsAsync_ThrowsHttpRequestException_WhenApiReturnsNon2xxNon404()
    {
        SetupCachePassThrough();
        var service = CreateService(new FakeHttpMessageHandler(
            new HttpResponseMessage(HttpStatusCode.InternalServerError)));

        var ex = await Assert.ThrowsAsync<HttpRequestException>(
            () => service.GetBookDetailsAsync("test-id"));

        Assert.Equal(HttpStatusCode.InternalServerError, ex.StatusCode);
    }

    [Fact]
    public async Task GetBookDetailsAsync_ThrowsHttpRequestException_WhenApiReturns403()
    {
        SetupCachePassThrough();
        var service = CreateService(new FakeHttpMessageHandler(
            new HttpResponseMessage(HttpStatusCode.Forbidden)));

        var ex = await Assert.ThrowsAsync<HttpRequestException>(
            () => service.GetBookDetailsAsync("test-id"));

        Assert.Equal(HttpStatusCode.Forbidden, ex.StatusCode);
    }

    [Fact]
    public async Task GetBookDetailsAsync_ReturnsBookDetails_WhenApiReturns200()
    {
        SetupCachePassThrough();
        const string json = """
            {
                "id": "test-id",
                "volumeInfo": {
                    "title": "Test Book",
                    "authors": ["Author One"],
                    "description": "A test description",
                    "pageCount": 300,
                    "publishedDate": "2023-01-01",
                    "publisher": "Test Publisher",
                    "imageLinks": { "thumbnail": "http://example.com/cover.jpg" },
                    "categories": ["Fiction"]
                }
            }
            """;
        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json")
        };
        var service = CreateService(new FakeHttpMessageHandler(response));

        var result = await service.GetBookDetailsAsync("test-id");

        Assert.NotNull(result);
        Assert.Equal("test-id", result.GoogleBooksId);
        Assert.Equal("Test Book", result.Title);
        Assert.Single(result.Authors);
        Assert.Equal("Author One", result.Authors[0]);
        Assert.Equal("https://example.com/cover.jpg", result.CoverImageUrl); // http → https
        Assert.Equal(300, result.PageCount);
        Assert.NotNull(result.Categories);
        Assert.Contains("Fiction", result.Categories);
    }

    [Fact]
    public async Task GetBookDetailsAsync_RethrowsException_WhenHttpClientThrows()
    {
        SetupCachePassThrough();
        var networkException = new HttpRequestException("Network error");
        var service = CreateService(FakeHttpMessageHandler.Throwing(networkException));

        var ex = await Assert.ThrowsAsync<HttpRequestException>(
            () => service.GetBookDetailsAsync("test-id"));

        Assert.Same(networkException, ex);
    }

    [Fact]
    public async Task GetBookDetailsAsync_ReturnsNull_WhenCacheContainsNullSentinel()
    {
        // Simulate a null-sentinel cache hit: GetOrSetAsync returns null without calling factory
        _cacheMock.Setup(x => x.GetOrSetAsync<BookDetailsDto>(
                It.IsAny<string>(),
                It.IsAny<Func<Task<BookDetailsDto?>>>(),
                It.IsAny<TimeSpan?>()))
            .ReturnsAsync((BookDetailsDto?)null);

        var httpCalled = false;
        var service = CreateService(new FakeHttpMessageHandler(_ =>
        {
            httpCalled = true;
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK));
        }));

        var result = await service.GetBookDetailsAsync("test-id");

        Assert.Null(result);
        Assert.False(httpCalled);
    }

    [Fact]
    public async Task GetBookDetailsAsync_ReturnsCachedValue_WhenCacheHit()
    {
        var cached = new BookDetailsDto("test-id", "Cached Book", ["Author"], null, null, null, null, null, null);
        _cacheMock.Setup(x => x.GetOrSetAsync<BookDetailsDto>(
                It.IsAny<string>(),
                It.IsAny<Func<Task<BookDetailsDto?>>>(),
                It.IsAny<TimeSpan?>()))
            .ReturnsAsync(cached);

        var httpCalled = false;
        var service = CreateService(new FakeHttpMessageHandler(_ =>
        {
            httpCalled = true;
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK));
        }));

        var result = await service.GetBookDetailsAsync("test-id");

        Assert.Same(cached, result);
        Assert.False(httpCalled);
    }

    private sealed class FakeHttpMessageHandler : HttpMessageHandler
    {
        private readonly Func<HttpRequestMessage, Task<HttpResponseMessage>> _sendAsync;

        public FakeHttpMessageHandler(HttpResponseMessage response)
            : this(_ => Task.FromResult(response)) { }

        public FakeHttpMessageHandler(Func<HttpRequestMessage, Task<HttpResponseMessage>> sendAsync)
            => _sendAsync = sendAsync;

        public static FakeHttpMessageHandler Throwing(Exception ex)
            => new(_ => throw ex);

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
            => _sendAsync(request);
    }
}
