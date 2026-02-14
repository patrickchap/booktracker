namespace BookTracker.Domain.Entities;

public class BookVote
{
    public Guid Id { get; set; }
    public Guid BookNominationId { get; set; }
    public Guid UserId { get; set; }
    public DateTime VotedAt { get; set; }

    public BookNomination BookNomination { get; set; } = null!;
    public User User { get; set; } = null!;
}
