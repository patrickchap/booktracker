using System.Net.Http.Json;
using System.Text.Json;
using BookTracker.Application.DTOs;
using BookTracker.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace BookTracker.Infrastructure.Services;

public class GoogleBooksService : IGoogleBooksService
{
    private readonly HttpClient _httpClient;
    private readonly ICacheService _cacheService;
    private readonly ILogger<GoogleBooksService> _logger;
    private readonly string _apiKey;
    private readonly string _baseUrl;

    private static readonly TimeSpan SearchCacheDuration = TimeSpan.FromHours(24);
    private static readonly TimeSpan DetailsCacheDuration = TimeSpan.FromDays(7);

    public GoogleBooksService(
        HttpClient httpClient,
        ICacheService cacheService,
        IConfiguration configuration,
        ILogger<GoogleBooksService> logger)
    {
        _httpClient = httpClient;
        _cacheService = cacheService;
        _logger = logger;
        _apiKey = configuration["GoogleBooks:ApiKey"] ?? throw new ArgumentNullException("GoogleBooks:ApiKey is not configured");
        _baseUrl = configuration["GoogleBooks:BaseUrl"] ?? "https://www.googleapis.com/books/v1";
    }

    public async Task<SearchResponseDto> SearchBooksAsync(string query, int startIndex = 0, int maxResults = 20)
    {
        var cacheKey = $"search:{query}:{startIndex}:{maxResults}";

        return await _cacheService.GetOrSetAsync(cacheKey, async () =>
        {
            var url = $"{_baseUrl}/volumes?q={Uri.EscapeDataString(query)}&startIndex={startIndex}&maxResults={maxResults}&key={_apiKey}";

            try
            {
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadFromJsonAsync<JsonElement>();

                var totalItems = json.TryGetProperty("totalItems", out var total) ? total.GetInt32() : 0;
                var items = new List<BookSearchResultDto>();

                if (json.TryGetProperty("items", out var itemsArray))
                {
                    foreach (var item in itemsArray.EnumerateArray())
                    {
                        var volumeInfo = item.GetProperty("volumeInfo");
                        var googleBooksId = item.GetProperty("id").GetString() ?? "";

                        items.Add(new BookSearchResultDto(
                            GoogleBooksId: googleBooksId,
                            Title: volumeInfo.TryGetProperty("title", out var title) ? title.GetString() ?? "" : "",
                            Authors: GetAuthors(volumeInfo),
                            CoverImageUrl: GetCoverImageUrl(volumeInfo),
                            PublishedDate: volumeInfo.TryGetProperty("publishedDate", out var date) ? date.GetString() : null
                        ));
                    }
                }

                return new SearchResponseDto(items, totalItems);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching Google Books API for query: {Query}", query);
                return new SearchResponseDto(new List<BookSearchResultDto>(), 0);
            }
        }, SearchCacheDuration);
    }

    public async Task<BookDetailsDto?> GetBookDetailsAsync(string googleBooksId)
    {
        var cacheKey = $"book:{googleBooksId}";

        return await _cacheService.GetOrSetAsync(cacheKey, async () =>
        {
            var url = $"{_baseUrl}/volumes/{googleBooksId}?key={_apiKey}";

            try
            {
                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Book not found: {GoogleBooksId}", googleBooksId);
                    return null!;
                }

                var json = await response.Content.ReadFromJsonAsync<JsonElement>();
                var volumeInfo = json.GetProperty("volumeInfo");

                return new BookDetailsDto(
                    GoogleBooksId: googleBooksId,
                    Title: volumeInfo.TryGetProperty("title", out var title) ? title.GetString() ?? "" : "",
                    Authors: GetAuthors(volumeInfo),
                    Description: volumeInfo.TryGetProperty("description", out var desc) ? desc.GetString() : null,
                    CoverImageUrl: GetCoverImageUrl(volumeInfo),
                    PageCount: volumeInfo.TryGetProperty("pageCount", out var pages) ? pages.GetInt32() : null,
                    PublishedDate: volumeInfo.TryGetProperty("publishedDate", out var date) ? date.GetString() : null,
                    Publisher: volumeInfo.TryGetProperty("publisher", out var pub) ? pub.GetString() : null,
                    Categories: GetCategories(volumeInfo)
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching book details from Google Books API: {GoogleBooksId}", googleBooksId);
                return null!;
            }
        }, DetailsCacheDuration);
    }

    private static List<string> GetAuthors(JsonElement volumeInfo)
    {
        if (!volumeInfo.TryGetProperty("authors", out var authors))
            return new List<string>();

        return authors.EnumerateArray()
            .Select(a => a.GetString() ?? "")
            .Where(a => !string.IsNullOrEmpty(a))
            .ToList();
    }

    private static string? GetCoverImageUrl(JsonElement volumeInfo)
    {
        if (!volumeInfo.TryGetProperty("imageLinks", out var imageLinks))
            return null;

        if (imageLinks.TryGetProperty("thumbnail", out var thumbnail))
            return thumbnail.GetString()?.Replace("http://", "https://");

        if (imageLinks.TryGetProperty("smallThumbnail", out var smallThumbnail))
            return smallThumbnail.GetString()?.Replace("http://", "https://");

        return null;
    }

    private static List<string>? GetCategories(JsonElement volumeInfo)
    {
        if (!volumeInfo.TryGetProperty("categories", out var categories))
            return null;

        return categories.EnumerateArray()
            .Select(c => c.GetString() ?? "")
            .Where(c => !string.IsNullOrEmpty(c))
            .ToList();
    }
}
