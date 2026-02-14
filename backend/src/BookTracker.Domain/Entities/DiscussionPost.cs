namespace BookTracker.Domain.Entities;

public class DiscussionPost
{
    public Guid Id { get; set; }
    public Guid DiscussionId { get; set; }
    public Guid AuthorUserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public Discussion Discussion { get; set; } = null!;
    public User AuthorUser { get; set; } = null!;
}
