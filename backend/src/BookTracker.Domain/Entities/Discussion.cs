namespace BookTracker.Domain.Entities;

public class Discussion
{
    public Guid Id { get; set; }
    public Guid ClubBookId { get; set; }
    public string Title { get; set; } = string.Empty;
    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsPinned { get; set; }

    public ClubBook ClubBook { get; set; } = null!;
    public User CreatedByUser { get; set; } = null!;
    public ICollection<DiscussionPost> Posts { get; set; } = new List<DiscussionPost>();
}
