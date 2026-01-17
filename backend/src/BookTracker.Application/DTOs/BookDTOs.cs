namespace BookTracker.Application.DTOs;

public record BookSearchResultDto(
    string GoogleBooksId,
    string Title,
    List<string> Authors,
    string? CoverImageUrl,
    string? PublishedDate
);

public record SearchResponseDto(
    List<BookSearchResultDto> Items,
    int TotalItems
);

public record BookDetailsDto(
    string GoogleBooksId,
    string Title,
    List<string> Authors,
    string? Description,
    string? CoverImageUrl,
    int? PageCount,
    string? PublishedDate,
    string? Publisher,
    List<string>? Categories
);
