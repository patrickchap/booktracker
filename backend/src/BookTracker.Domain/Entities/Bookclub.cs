using BookTracker.Domain.Enums;

namespace BookTracker.Domain.Entities;

public class BookClub
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public ClubPrivacy Privacy { get; set; }
    public BookSelectionMethod SelectionMethod { get; set; }
    public string InviteCode { get; set; } = string.Empty;
    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User CreatedByUser { get; set; } = null!;
    public ICollection<ClubMember> Members { get; set; } = new List<ClubMember>();
    public ICollection<ClubBook> Books { get; set; } = new List<ClubBook>();
}
