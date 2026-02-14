using BookTracker.Domain.Enums;

namespace BookTracker.Domain.Entities;

public class ClubMember
{
    public Guid Id { get; set; }
    public Guid BookClubId { get; set; }
    public Guid UserId { get; set; }
    public ClubMemberRole Role { get; set; }
    public int RoundRobinOrder { get; set; }
    public DateTime JoinedAt { get; set; }

    public BookClub BookClub { get; set; } = null!;
    public User User { get; set; } = null!;
}
