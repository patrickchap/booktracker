namespace BookTracker.Domain.Entities;

public class ReadingSchedule
{
    public Guid Id { get; set; }
    public Guid ClubBookId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime DueDate { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }

    public ClubBook ClubBook { get; set; } = null!;
}
