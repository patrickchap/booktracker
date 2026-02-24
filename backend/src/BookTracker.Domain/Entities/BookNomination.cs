namespace BookTracker.Domain.Entities;

public class BookNomination
{
    public Guid Id { get; set; }
    public Guid ClubBookId { get; set; }
    public Guid NominatedByUserId { get; set; }
    public string? Reason { get; set; }
    public DateTime NominatedAt { get; set; }

    public ClubBook ClubBook { get; set; } = null!;
    public User NominatedByUser { get; set; } = null!;
    public ICollection<BookVote> Votes { get; set; } = new List<BookVote>();
}
