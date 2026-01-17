using BookTracker.Domain.Entities;
using BookTracker.Domain.Enums;
using BookTracker.Infrastructure.Data;
using BookTracker.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Tests;

public class UserBookRepositoryTests
{
    private BookTrackerDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<BookTrackerDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new BookTrackerDbContext(options);
    }

    [Fact]
    public async Task CreateAsync_CreatesNewUserBook()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserBookRepository(context);
        var userId = Guid.NewGuid();

        // Create user first
        context.Users.Add(new User
        {
            Id = userId,
            GoogleId = "google123",
            Email = "test@test.com",
            DisplayName = "Test User",
            CreatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var userBook = new UserBook
        {
            UserId = userId,
            GoogleBooksId = "book123",
            Title = "Test Book",
            Status = ReadingStatus.WantToRead
        };

        // Act
        var result = await repository.CreateAsync(userBook);

        // Assert
        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal("Test Book", result.Title);
        Assert.NotEqual(default, result.AddedAt);
    }

    [Fact]
    public async Task GetByUserIdAsync_ReturnsUserBooks()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserBookRepository(context);
        var userId = Guid.NewGuid();

        context.Users.Add(new User
        {
            Id = userId,
            GoogleId = "google123",
            Email = "test@test.com",
            DisplayName = "Test User",
            CreatedAt = DateTime.UtcNow
        });

        context.UserBooks.AddRange(
            new UserBook
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                GoogleBooksId = "book1",
                Title = "Book 1",
                Status = ReadingStatus.WantToRead,
                AddedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new UserBook
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                GoogleBooksId = "book2",
                Title = "Book 2",
                Status = ReadingStatus.CurrentlyReading,
                AddedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );
        await context.SaveChangesAsync();

        // Act
        var result = await repository.GetByUserIdAsync(userId);

        // Assert
        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetByUserIdAsync_FiltersByStatus()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserBookRepository(context);
        var userId = Guid.NewGuid();

        context.Users.Add(new User
        {
            Id = userId,
            GoogleId = "google123",
            Email = "test@test.com",
            DisplayName = "Test User",
            CreatedAt = DateTime.UtcNow
        });

        context.UserBooks.AddRange(
            new UserBook
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                GoogleBooksId = "book1",
                Title = "Book 1",
                Status = ReadingStatus.WantToRead,
                AddedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new UserBook
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                GoogleBooksId = "book2",
                Title = "Book 2",
                Status = ReadingStatus.CurrentlyReading,
                AddedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );
        await context.SaveChangesAsync();

        // Act
        var result = await repository.GetByUserIdAsync(userId, ReadingStatus.WantToRead);

        // Assert
        Assert.Single(result);
        Assert.Equal("Book 1", result.First().Title);
    }

    [Fact]
    public async Task ExistsAsync_ReturnsTrueIfExists()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserBookRepository(context);
        var userId = Guid.NewGuid();

        context.Users.Add(new User
        {
            Id = userId,
            GoogleId = "google123",
            Email = "test@test.com",
            DisplayName = "Test User",
            CreatedAt = DateTime.UtcNow
        });

        context.UserBooks.Add(new UserBook
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            GoogleBooksId = "book123",
            Title = "Test Book",
            Status = ReadingStatus.WantToRead,
            AddedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        // Act
        var exists = await repository.ExistsAsync(userId, "book123");
        var notExists = await repository.ExistsAsync(userId, "nonexistent");

        // Assert
        Assert.True(exists);
        Assert.False(notExists);
    }

    [Fact]
    public async Task DeleteAsync_RemovesBook()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new UserBookRepository(context);
        var userId = Guid.NewGuid();
        var bookId = Guid.NewGuid();

        context.Users.Add(new User
        {
            Id = userId,
            GoogleId = "google123",
            Email = "test@test.com",
            DisplayName = "Test User",
            CreatedAt = DateTime.UtcNow
        });

        context.UserBooks.Add(new UserBook
        {
            Id = bookId,
            UserId = userId,
            GoogleBooksId = "book123",
            Title = "Test Book",
            Status = ReadingStatus.WantToRead,
            AddedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        // Act
        var result = await repository.DeleteAsync(userId, bookId);

        // Assert
        Assert.True(result);
        Assert.Empty(context.UserBooks);
    }
}
