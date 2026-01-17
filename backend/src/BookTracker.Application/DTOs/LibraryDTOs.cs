using BookTracker.Domain.Enums;

namespace BookTracker.Application.DTOs;

public record UserBookDto(
    Guid Id,
    string GoogleBooksId,
    string Title,
    List<string> Authors,
    string? CoverImageUrl,
    ReadingStatus Status,
    DateTime? StartedAt,
    DateTime? FinishedAt,
    int? Rating,
    string? Notes,
    DateTime AddedAt
);

public record AddBookDto(
    string GoogleBooksId,
    ReadingStatus Status = ReadingStatus.WantToRead
);

public record UpdateBookDto(
    ReadingStatus? Status,
    DateTime? StartedAt,
    DateTime? FinishedAt,
    int? Rating,
    string? Notes
);
