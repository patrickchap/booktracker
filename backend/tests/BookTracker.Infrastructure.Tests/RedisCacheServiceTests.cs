using System.Text;
using System.Text.Json;
using BookTracker.Infrastructure.Caching;
using Microsoft.Extensions.Caching.Distributed;
using Moq;

namespace BookTracker.Infrastructure.Tests;

public class RedisCacheServiceTests
{
    private readonly Mock<IDistributedCache> _cacheMock;
    private readonly RedisCacheService _service;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public RedisCacheServiceTests()
    {
        _cacheMock = new Mock<IDistributedCache>();
        _service = new RedisCacheService(_cacheMock.Object);
    }

    private static byte[] ToBytes(string s) => Encoding.UTF8.GetBytes(s);

    private void SetupGet(string key, byte[]? value) =>
        _cacheMock.Setup(x => x.GetAsync(key, It.IsAny<CancellationToken>()))
            .ReturnsAsync(value);

    private void SetupSet() =>
        _cacheMock.Setup(x => x.SetAsync(
                It.IsAny<string>(), It.IsAny<byte[]>(),
                It.IsAny<DistributedCacheEntryOptions>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

    [Fact]
    public async Task GetAsync_ReturnsNull_WhenKeyNotInCache()
    {
        SetupGet("key", null);

        var result = await _service.GetAsync<TestObject>("key");

        Assert.Null(result);
    }

    [Fact]
    public async Task GetAsync_ReturnsNull_WhenCachedValueIsNullSentinel()
    {
        SetupGet("key", ToBytes("__null__"));

        var result = await _service.GetAsync<TestObject>("key");

        Assert.Null(result);
    }

    [Fact]
    public async Task GetAsync_ReturnsDeserializedValue_WhenKeyExists()
    {
        var json = JsonSerializer.Serialize(new TestObject { Name = "Test" }, JsonOptions);
        SetupGet("key", ToBytes(json));

        var result = await _service.GetAsync<TestObject>("key");

        Assert.NotNull(result);
        Assert.Equal("Test", result.Name);
    }

    [Fact]
    public async Task GetOrSetAsync_ReturnsNull_WhenCachedNullSentinel_AndDoesNotCallFactory()
    {
        SetupGet("key", ToBytes("__null__"));

        var factoryCalled = false;
        var result = await _service.GetOrSetAsync<TestObject>("key", () =>
        {
            factoryCalled = true;
            return Task.FromResult<TestObject?>(null);
        });

        Assert.Null(result);
        Assert.False(factoryCalled);
    }

    [Fact]
    public async Task GetOrSetAsync_ReturnsCachedValue_WhenKeyExists_AndDoesNotCallFactory()
    {
        var json = JsonSerializer.Serialize(new TestObject { Name = "Cached" }, JsonOptions);
        SetupGet("key", ToBytes(json));

        var factoryCalled = false;
        var result = await _service.GetOrSetAsync<TestObject>("key", () =>
        {
            factoryCalled = true;
            return Task.FromResult<TestObject?>(new TestObject { Name = "Cached" });
        });

        Assert.NotNull(result);
        Assert.Equal("Cached", result.Name);
        Assert.False(factoryCalled);
    }

    [Fact]
    public async Task GetOrSetAsync_CallsFactory_StoresResult_WhenCacheMiss()
    {
        SetupGet("key", null);
        SetupSet();

        var result = await _service.GetOrSetAsync<TestObject>("key",
            () => Task.FromResult<TestObject?>(new TestObject { Name = "FromFactory" }));

        Assert.NotNull(result);
        Assert.Equal("FromFactory", result.Name);
        _cacheMock.Verify(x => x.SetAsync(
            "key", It.IsAny<byte[]>(),
            It.IsAny<DistributedCacheEntryOptions>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task GetOrSetAsync_CallsFactory_StoresNullSentinel_WhenFactoryReturnsNull()
    {
        SetupGet("key", null);

        byte[]? storedBytes = null;
        _cacheMock.Setup(x => x.SetAsync(
                "key", It.IsAny<byte[]>(),
                It.IsAny<DistributedCacheEntryOptions>(), It.IsAny<CancellationToken>()))
            .Callback<string, byte[], DistributedCacheEntryOptions, CancellationToken>(
                (_, bytes, _, _) => storedBytes = bytes)
            .Returns(Task.CompletedTask);

        var result = await _service.GetOrSetAsync<TestObject>("key",
            () => Task.FromResult<TestObject?>(null));

        Assert.Null(result);
        Assert.NotNull(storedBytes);
        Assert.Equal("__null__", Encoding.UTF8.GetString(storedBytes));
    }

    [Fact]
    public async Task GetOrSetAsync_RespectsExpiration_WhenProvided()
    {
        SetupGet("key", null);

        DistributedCacheEntryOptions? capturedOptions = null;
        _cacheMock.Setup(x => x.SetAsync(
                "key", It.IsAny<byte[]>(),
                It.IsAny<DistributedCacheEntryOptions>(), It.IsAny<CancellationToken>()))
            .Callback<string, byte[], DistributedCacheEntryOptions, CancellationToken>(
                (_, _, opts, _) => capturedOptions = opts)
            .Returns(Task.CompletedTask);

        var expiration = TimeSpan.FromMinutes(30);
        await _service.GetOrSetAsync("key",
            () => Task.FromResult<TestObject?>(new TestObject { Name = "x" }),
            expiration);

        Assert.NotNull(capturedOptions);
        Assert.Equal(expiration, capturedOptions.AbsoluteExpirationRelativeToNow);
    }

    private class TestObject
    {
        public string Name { get; set; } = "";
    }
}
