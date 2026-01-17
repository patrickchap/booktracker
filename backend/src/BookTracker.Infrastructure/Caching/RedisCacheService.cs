using System.Text.Json;
using BookTracker.Application.Interfaces;
using Microsoft.Extensions.Caching.Distributed;

namespace BookTracker.Infrastructure.Caching;

public class RedisCacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public RedisCacheService(IDistributedCache cache)
    {
        _cache = cache;
    }

    public async Task<T?> GetAsync<T>(string key) where T : class
    {
        var data = await _cache.GetStringAsync(key);
        if (string.IsNullOrEmpty(data)) return null;

        return JsonSerializer.Deserialize<T>(data, JsonOptions);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null) where T : class
    {
        var options = new DistributedCacheEntryOptions();
        if (expiration.HasValue)
        {
            options.AbsoluteExpirationRelativeToNow = expiration;
        }

        var data = JsonSerializer.Serialize(value, JsonOptions);
        await _cache.SetStringAsync(key, data, options);
    }

    public async Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null) where T : class
    {
        var cached = await GetAsync<T>(key);
        if (cached != null) return cached;

        var value = await factory();
        await SetAsync(key, value, expiration);
        return value;
    }

    public async Task RemoveAsync(string key)
    {
        await _cache.RemoveAsync(key);
    }
}
