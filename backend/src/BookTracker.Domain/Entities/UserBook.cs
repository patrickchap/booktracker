using BookTracker.Domain.Enums;

namespace BookTracker.Domain.Entities;

public class UserBook
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string GoogleBooksId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Authors { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? Description { get; set; }
    public int? PageCount { get; set; }
    public string? PublishedDate { get; set; }
    public ReadingStatus Status { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }
    public int? Rating { get; set; }
    public string? Notes { get; set; }
    public DateTime AddedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public User User { get; set; } = null!;
}
