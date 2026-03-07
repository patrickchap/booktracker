using BookTracker.Domain.Entities;
using BookTracker.Domain.Enums;
using BookTracker.Infrastructure.Data;
using BookTracker.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace BookTracker.Api.Tests.Services;

public class BookClubServiceTests
{
    private static BookTrackerDbContext CreateDb() =>
        new BookTrackerDbContext(
            new DbContextOptionsBuilder<BookTrackerDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options);

    private static User CreateUser(Guid? id = null) => new User
    {
        Id = id ?? Guid.NewGuid(),
        GoogleId = Guid.NewGuid().ToString(),
        Email = "test@example.com",
        DisplayName = "Test User",
        CreatedAt = DateTime.UtcNow
    };

    private static BookClub CreateClub(Guid createdByUserId, ClubPrivacy privacy = ClubPrivacy.Public) => new BookClub
    {
        Id = Guid.NewGuid(),
        Name = "Test Club",
        Privacy = privacy,
        InviteCode = Guid.NewGuid().ToString()[..8],
        CreatedByUserId = createdByUserId,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    [Fact]
    public async Task GetMyClubsAsync_ReturnsClubs_ForMember()
    {
        using var db = CreateDb();
        var user = CreateUser();
        var club = CreateClub(user.Id);
        db.Users.Add(user);
        db.BookClubs.Add(club);
        db.ClubMembers.Add(new ClubMember
        {
            Id = Guid.NewGuid(),
            BookClubId = club.Id,
            UserId = user.Id,
            Role = ClubMemberRole.Member,
            JoinedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var service = new BookClubService(db);
        var result = await service.GetMyClubsAsync(user.Id);

        Assert.Single(result);
        Assert.Equal("Test Club", result[0].Name);
    }

    [Fact]
    public async Task GetMyClubsAsync_ReturnsEmpty_WhenNoMemberships()
    {
        using var db = CreateDb();
        var service = new BookClubService(db);

        var result = await service.GetMyClubsAsync(Guid.NewGuid());

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetMyClubsAsync_IncludesCurrentBook()
    {
        using var db = CreateDb();
        var user = CreateUser();
        var club = CreateClub(user.Id);
        db.Users.Add(user);
        db.BookClubs.Add(club);
        db.ClubMembers.Add(new ClubMember
        {
            Id = Guid.NewGuid(),
            BookClubId = club.Id,
            UserId = user.Id,
            Role = ClubMemberRole.Member,
            JoinedAt = DateTime.UtcNow
        });
        db.ClubBooks.Add(new ClubBook
        {
            Id = Guid.NewGuid(),
            BookClubId = club.Id,
            GoogleBooksId = "book1",
            Title = "Current Book",
            Authors = JsonSerializer.Serialize(new[] { "Author One" }),
            Status = ClubBookStatus.Current,
            AddedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var service = new BookClubService(db);
        var result = await service.GetMyClubsAsync(user.Id);

        Assert.NotNull(result[0].CurrentBook);
        Assert.Equal("Current Book", result[0].CurrentBook!.Title);
    }

    [Fact]
    public async Task GetMyClubsAsync_NullCurrentBook_WhenNoCurrentBook()
    {
        using var db = CreateDb();
        var user = CreateUser();
        var club = CreateClub(user.Id);
        db.Users.Add(user);
        db.BookClubs.Add(club);
        db.ClubMembers.Add(new ClubMember
        {
            Id = Guid.NewGuid(),
            BookClubId = club.Id,
            UserId = user.Id,
            Role = ClubMemberRole.Member,
            JoinedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var service = new BookClubService(db);
        var result = await service.GetMyClubsAsync(user.Id);

        Assert.Null(result[0].CurrentBook);
    }

    [Fact]
    public async Task GetClubByIdAsync_ReturnsClub_ForPublicClub()
    {
        using var db = CreateDb();
        var owner = CreateUser();
        var club = CreateClub(owner.Id, ClubPrivacy.Public);
        db.Users.Add(owner);
        db.BookClubs.Add(club);
        await db.SaveChangesAsync();

        var service = new BookClubService(db);
        var result = await service.GetClubByIdAsync(Guid.NewGuid(), club.Id);

        Assert.NotNull(result);
        Assert.Equal(club.Id, result!.Id);
    }

    [Fact]
    public async Task GetClubByIdAsync_ReturnsClub_ForPrivateClub_WhenMember()
    {
        using var db = CreateDb();
        var owner = CreateUser();
        var member = CreateUser();
        var club = CreateClub(owner.Id, ClubPrivacy.Private);
        db.Users.AddRange(owner, member);
        db.BookClubs.Add(club);
        db.ClubMembers.Add(new ClubMember
        {
            Id = Guid.NewGuid(),
            BookClubId = club.Id,
            UserId = member.Id,
            Role = ClubMemberRole.Member,
            JoinedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var service = new BookClubService(db);
        var result = await service.GetClubByIdAsync(member.Id, club.Id);

        Assert.NotNull(result);
        Assert.Equal(club.Id, result!.Id);
    }

    [Fact]
    public async Task GetClubByIdAsync_ThrowsUnauthorizedAccessException_ForPrivateClub_WhenNotMember()
    {
        using var db = CreateDb();
        var owner = CreateUser();
        var club = CreateClub(owner.Id, ClubPrivacy.Private);
        db.Users.Add(owner);
        db.BookClubs.Add(club);
        await db.SaveChangesAsync();

        var service = new BookClubService(db);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => service.GetClubByIdAsync(Guid.NewGuid(), club.Id));
    }

    [Fact]
    public async Task GetClubByIdAsync_ReturnsNull_WhenClubDoesNotExist()
    {
        using var db = CreateDb();
        var service = new BookClubService(db);

        var result = await service.GetClubByIdAsync(Guid.NewGuid(), Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task GetPublicClubsAsync_ReturnsOnlyPublicClubs()
    {
        using var db = CreateDb();
        var user = CreateUser();
        var publicClub = CreateClub(user.Id, ClubPrivacy.Public);
        var privateClub = CreateClub(user.Id, ClubPrivacy.Private);
        db.Users.Add(user);
        db.BookClubs.AddRange(publicClub, privateClub);
        await db.SaveChangesAsync();

        var service = new BookClubService(db);
        var result = await service.GetPublicClubsAsync(Guid.NewGuid(), 1, 20);

        Assert.Single(result);
        Assert.Equal("Public", result[0].Privacy);
    }

    [Fact]
    public async Task GetPublicClubsAsync_ExcludesUsersMemberships()
    {
        using var db = CreateDb();
        var user = CreateUser();
        var memberClub = CreateClub(user.Id, ClubPrivacy.Public);
        var otherClub = CreateClub(user.Id, ClubPrivacy.Public);
        db.Users.Add(user);
        db.BookClubs.AddRange(memberClub, otherClub);
        db.ClubMembers.Add(new ClubMember
        {
            Id = Guid.NewGuid(),
            BookClubId = memberClub.Id,
            UserId = user.Id,
            Role = ClubMemberRole.Admin,
            JoinedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var service = new BookClubService(db);
        var result = await service.GetPublicClubsAsync(user.Id, 1, 20);

        Assert.Single(result);
        Assert.Equal(otherClub.Id, result[0].Id);
    }

    [Fact]
    public async Task GetPublicClubsAsync_RespectsPagination()
    {
        using var db = CreateDb();
        var user = CreateUser();
        var clubs = Enumerable.Range(0, 5).Select(_ => CreateClub(user.Id, ClubPrivacy.Public)).ToList();
        db.Users.Add(user);
        db.BookClubs.AddRange(clubs);
        await db.SaveChangesAsync();

        var nonMemberId = Guid.NewGuid();
        var service = new BookClubService(db);
        var page1 = await service.GetPublicClubsAsync(nonMemberId, 1, 2);
        var page2 = await service.GetPublicClubsAsync(nonMemberId, 2, 2);

        Assert.Equal(2, page1.Count);
        Assert.Equal(2, page2.Count);
        Assert.DoesNotContain(page2, c => page1.Any(p => p.Id == c.Id));
    }

    [Fact]
    public async Task GetPublicClubsAsync_DeserializesAuthorsJson()
    {
        using var db = CreateDb();
        var user = CreateUser();
        var club = CreateClub(user.Id, ClubPrivacy.Public);
        db.Users.Add(user);
        db.BookClubs.Add(club);
        db.ClubBooks.Add(new ClubBook
        {
            Id = Guid.NewGuid(),
            BookClubId = club.Id,
            GoogleBooksId = "book1",
            Title = "Current Book",
            Authors = JsonSerializer.Serialize(new[] { "Jane Doe", "John Smith" }),
            Status = ClubBookStatus.Current,
            AddedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var service = new BookClubService(db);
        // Use a non-member user so the club is not excluded
        var result = await service.GetPublicClubsAsync(Guid.NewGuid(), 1, 20);

        Assert.Single(result);
        Assert.NotNull(result[0].CurrentBook);
        Assert.Equal(2, result[0].CurrentBook!.Authors.Count);
        Assert.Contains("Jane Doe", result[0].CurrentBook.Authors);
        Assert.Contains("John Smith", result[0].CurrentBook.Authors);
    }

    [Fact]
    public async Task CreateClubAsync_CreatesClub_WithAdminMember()
    {
        using var db = CreateDb();
        var user = CreateUser();
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var service = new BookClubService(db);
        var request = new BookTracker.Application.DTOs.CreateBookClubRequest("New Club", "Public", new List<Guid>());
        var result = await service.CreateClubAsync(user.Id, request);

        Assert.Equal("New Club", result.Name);
        Assert.Equal("Public", result.Privacy);
        Assert.Equal(1, result.MemberCount);

        var savedClub = await db.BookClubs.FindAsync(result.Id);
        Assert.NotNull(savedClub);
        Assert.Equal(user.Id, savedClub!.CreatedByUserId);
        Assert.Equal(8, savedClub.InviteCode.Length);

        var members = db.ClubMembers.Where(m => m.BookClubId == result.Id).ToList();
        Assert.Single(members);
        Assert.Equal(ClubMemberRole.Admin, members[0].Role);
        Assert.Equal(user.Id, members[0].UserId);
    }

    [Fact]
    public async Task CreateClubAsync_AddsInvitedMembers_WhenTheyExist()
    {
        using var db = CreateDb();
        var creator = CreateUser();
        var invited1 = CreateUser();
        var invited2 = CreateUser();
        db.Users.AddRange(creator, invited1, invited2);
        await db.SaveChangesAsync();

        var service = new BookClubService(db);
        var request = new BookTracker.Application.DTOs.CreateBookClubRequest(
            "Club With Members", "Private",
            new List<Guid> { invited1.Id, invited2.Id });

        var result = await service.CreateClubAsync(creator.Id, request);

        Assert.Equal(3, result.MemberCount);
        var members = db.ClubMembers.Where(m => m.BookClubId == result.Id).ToList();
        Assert.Equal(3, members.Count);
        Assert.Single(members, m => m.Role == ClubMemberRole.Admin);
        Assert.Equal(2, members.Count(m => m.Role == ClubMemberRole.Member));
    }

    [Fact]
    public async Task CreateClubAsync_IgnoresInvalidUserIds()
    {
        using var db = CreateDb();
        var creator = CreateUser();
        db.Users.Add(creator);
        await db.SaveChangesAsync();

        var service = new BookClubService(db);
        var request = new BookTracker.Application.DTOs.CreateBookClubRequest(
            "Club", "Public",
            new List<Guid> { Guid.NewGuid(), Guid.NewGuid() });

        var result = await service.CreateClubAsync(creator.Id, request);

        Assert.Equal(1, result.MemberCount);
        var members = db.ClubMembers.Where(m => m.BookClubId == result.Id).ToList();
        Assert.Single(members);
    }

    [Fact]
    public async Task CreateClubAsync_CreatesPrivateClub()
    {
        using var db = CreateDb();
        var user = CreateUser();
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var service = new BookClubService(db);
        var request = new BookTracker.Application.DTOs.CreateBookClubRequest("Private Club", "Private", new List<Guid>());
        var result = await service.CreateClubAsync(user.Id, request);

        Assert.Equal("Private", result.Privacy);
    }

    [Fact]
    public async Task DeleteClubAsync_DeletesClub_WhenOwner()
    {
        using var db = CreateDb();
        var owner = CreateUser();
        var club = CreateClub(owner.Id);
        db.Users.Add(owner);
        db.BookClubs.Add(club);
        await db.SaveChangesAsync();

        var service = new BookClubService(db);
        await service.DeleteClubAsync(owner.Id, club.Id);

        Assert.Null(await db.BookClubs.FindAsync(club.Id));
    }

    [Fact]
    public async Task DeleteClubAsync_ThrowsKeyNotFoundException_WhenClubNotFound()
    {
        using var db = CreateDb();
        var service = new BookClubService(db);

        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => service.DeleteClubAsync(Guid.NewGuid(), Guid.NewGuid()));
    }

    [Fact]
    public async Task DeleteClubAsync_ThrowsUnauthorizedAccessException_WhenNotOwner()
    {
        using var db = CreateDb();
        var owner = CreateUser();
        var nonOwner = CreateUser();
        var club = CreateClub(owner.Id);
        db.Users.AddRange(owner, nonOwner);
        db.BookClubs.Add(club);
        await db.SaveChangesAsync();

        var service = new BookClubService(db);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => service.DeleteClubAsync(nonOwner.Id, club.Id));
    }

    [Fact]
    public async Task SearchUsersAsync_ReturnsMatchingUsers_ByDisplayName()
    {
        using var db = CreateDb();
        var searcher = CreateUser();
        var alice = new User { Id = Guid.NewGuid(), GoogleId = "g1", Email = "alice@test.com", DisplayName = "Alice Smith", CreatedAt = DateTime.UtcNow };
        var bob = new User { Id = Guid.NewGuid(), GoogleId = "g2", Email = "bob@test.com", DisplayName = "Bob Jones", CreatedAt = DateTime.UtcNow };
        db.Users.AddRange(searcher, alice, bob);
        await db.SaveChangesAsync();

        var service = new BookClubService(db);
        var result = await service.SearchUsersAsync("alice", searcher.Id);

        Assert.Single(result);
        Assert.Equal("Alice Smith", result[0].DisplayName);
    }

    [Fact]
    public async Task SearchUsersAsync_ReturnsMatchingUsers_ByEmail()
    {
        using var db = CreateDb();
        var searcher = CreateUser();
        var user = new User { Id = Guid.NewGuid(), GoogleId = "g1", Email = "findme@test.com", DisplayName = "Some User", CreatedAt = DateTime.UtcNow };
        db.Users.AddRange(searcher, user);
        await db.SaveChangesAsync();

        var service = new BookClubService(db);
        var result = await service.SearchUsersAsync("findme", searcher.Id);

        Assert.Single(result);
        Assert.Equal("findme@test.com", result[0].Email);
    }

    [Fact]
    public async Task SearchUsersAsync_ExcludesCurrentUser()
    {
        using var db = CreateDb();
        var searcher = new User { Id = Guid.NewGuid(), GoogleId = "g0", Email = "searcher@test.com", DisplayName = "Searcher", CreatedAt = DateTime.UtcNow };
        db.Users.Add(searcher);
        await db.SaveChangesAsync();

        var service = new BookClubService(db);
        var result = await service.SearchUsersAsync("searcher", searcher.Id);

        Assert.Empty(result);
    }

    [Fact]
    public async Task SearchUsersAsync_LimitsTo10Results()
    {
        using var db = CreateDb();
        var searcher = CreateUser();
        var users = Enumerable.Range(1, 15).Select(i => new User
        {
            Id = Guid.NewGuid(),
            GoogleId = $"g{i}",
            Email = $"user{i}@test.com",
            DisplayName = $"Test User {i}",
            CreatedAt = DateTime.UtcNow
        }).ToList();
        db.Users.Add(searcher);
        db.Users.AddRange(users);
        await db.SaveChangesAsync();

        var service = new BookClubService(db);
        var result = await service.SearchUsersAsync("test", searcher.Id);

        Assert.Equal(10, result.Count);
    }
}
