using System.Text.Json;
using BookTracker.Application.DTOs;
using BookTracker.Application.Interfaces;
using BookTracker.Domain.Enums;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Services;

public class BookClubService : IBookClubService
{
    private readonly BookTrackerDbContext _db;

    public BookClubService(BookTrackerDbContext db)
    {
        _db = db;
    }

    public async Task<BookClubSummaryDto?> GetClubByIdAsync(Guid userId, Guid clubId)
    {
        var club = await _db.BookClubs
            .Include(c => c.Members)
            .Include(c => c.Books)
            .FirstOrDefaultAsync(c => c.Id == clubId);

        if (club == null) return null;

        if (club.Privacy == ClubPrivacy.Private && club.Members.All(m => m.UserId != userId))
            throw new UnauthorizedAccessException("You do not have access to this club.");

        return MapToSummaryDto(club);
    }

    public async Task<List<BookClubSummaryDto>> GetMyClubsAsync(Guid userId)
    {
        var memberships = await _db.ClubMembers
            .Where(m => m.UserId == userId)
            .Include(m => m.BookClub)
                .ThenInclude(c => c.Members)
            .Include(m => m.BookClub)
                .ThenInclude(c => c.Books)
            .ToListAsync();

        return memberships
            .Select(m => MapToSummaryDto(m.BookClub))
            .ToList();
    }

    public async Task<List<BookClubSummaryDto>> GetPublicClubsAsync(Guid userId, int page, int pageSize)
    {
        var memberClubIds = await _db.ClubMembers
            .Where(m => m.UserId == userId)
            .Select(m => m.BookClubId)
            .ToListAsync();

        var clubs = await _db.BookClubs
            .Where(c => c.Privacy == ClubPrivacy.Public && !memberClubIds.Contains(c.Id))
            .Include(c => c.Members)
            .Include(c => c.Books)
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .ToListAsync();

        return clubs.Select(MapToSummaryDto).ToList();
    }

    public async Task<BookClubSummaryDto> CreateClubAsync(Guid userId, CreateBookClubRequest request)
    {
        if (!Enum.TryParse<ClubPrivacy>(request.Privacy, ignoreCase: true, out var privacy))
            throw new ArgumentException($"Invalid privacy value: {request.Privacy}");

        var inviteCode = Guid.NewGuid().ToString("N")[..8];

        var club = new Domain.Entities.BookClub
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Privacy = privacy,
            InviteCode = inviteCode,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        club.Members.Add(new Domain.Entities.ClubMember
        {
            Id = Guid.NewGuid(),
            BookClubId = club.Id,
            UserId = userId,
            Role = ClubMemberRole.Admin,
            JoinedAt = DateTime.UtcNow
        });

        if (request.InvitedUserIds.Count > 0)
        {
            var existingUserIds = await _db.Users
                .Where(u => request.InvitedUserIds.Contains(u.Id) && u.Id != userId)
                .Select(u => u.Id)
                .ToListAsync();

            foreach (var invitedId in existingUserIds)
            {
                club.Members.Add(new Domain.Entities.ClubMember
                {
                    Id = Guid.NewGuid(),
                    BookClubId = club.Id,
                    UserId = invitedId,
                    Role = ClubMemberRole.Member,
                    JoinedAt = DateTime.UtcNow
                });
            }
        }

        _db.BookClubs.Add(club);
        await _db.SaveChangesAsync();

        return MapToSummaryDto(club);
    }

    public async Task DeleteClubAsync(Guid userId, Guid clubId)
    {
        var club = await _db.BookClubs.FindAsync(clubId)
            ?? throw new KeyNotFoundException($"Club {clubId} not found.");

        if (club.CreatedByUserId != userId)
            throw new UnauthorizedAccessException("Only the club owner can delete this club.");

        _db.BookClubs.Remove(club);
        await _db.SaveChangesAsync();
    }

    public async Task<List<UserSearchResultDto>> SearchUsersAsync(string query, Guid currentUserId)
    {
        var lowerQuery = query.ToLower();
        var users = await _db.Users
            .Where(u => u.Id != currentUserId &&
                        (u.DisplayName.ToLower().Contains(lowerQuery) ||
                         u.Email.ToLower().Contains(lowerQuery)))
            .Take(10)
            .Select(u => new UserSearchResultDto(u.Id, u.DisplayName, u.Email, u.AvatarUrl))
            .ToListAsync();

        return users;
    }

    private static BookClubSummaryDto MapToSummaryDto(Domain.Entities.BookClub club)
    {
        var currentBook = club.Books.FirstOrDefault(b => b.Status == ClubBookStatus.Current);
        CurrentBookDto? currentBookDto = null;

        if (currentBook != null)
        {
            List<string> authors;
            if (string.IsNullOrEmpty(currentBook.Authors))
            {
                authors = new List<string>();
            }
            else
            {
                try
                {
                    authors = JsonSerializer.Deserialize<List<string>>(currentBook.Authors) ?? new List<string>();
                }
                catch (JsonException)
                {
                    authors = new List<string>();
                }
            }

            currentBookDto = new CurrentBookDto(
                Title: currentBook.Title,
                CoverImageUrl: currentBook.CoverImageUrl,
                Authors: authors
            );
        }

        return new BookClubSummaryDto(
            Id: club.Id,
            Name: club.Name,
            Description: club.Description,
            CoverImageUrl: club.CoverImageUrl,
            Privacy: club.Privacy.ToString(),
            MemberCount: club.Members.Count,
            CurrentBook: currentBookDto,
            CreatedByUserId: club.CreatedByUserId
        );
    }
}
