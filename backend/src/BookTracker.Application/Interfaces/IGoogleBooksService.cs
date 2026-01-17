using BookTracker.Application.DTOs;

namespace BookTracker.Application.Interfaces;

public interface IGoogleBooksService
{
    Task<SearchResponseDto> SearchBooksAsync(string query, int startIndex = 0, int maxResults = 20);
    Task<BookDetailsDto?> GetBookDetailsAsync(string googleBooksId);
}
