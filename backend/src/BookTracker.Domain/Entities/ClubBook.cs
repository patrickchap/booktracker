using BookTracker.Domain.Enums;

namespace BookTracker.Domain.Entities;

public class ClubBook
{
    public Guid Id { get; set; }
    public Guid BookClubId { get; set; }
    public string GoogleBooksId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Authors { get; set; }
    public string? CoverImageUrl { get; set; }
    public Guid? SelectedByUserId { get; set; }
    public ClubBookStatus Status { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime AddedAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }

    public BookClub BookClub { get; set; } = null!;
    public User? SelectedByUser { get; set; }
    public ICollection<ReadingSchedule> Schedules { get; set; } = new List<ReadingSchedule>();
    public ICollection<Discussion> Discussions { get; set; } = new List<Discussion>();
    public ICollection<BookNomination> Nominations { get; set; } = new List<BookNomination>();
}
