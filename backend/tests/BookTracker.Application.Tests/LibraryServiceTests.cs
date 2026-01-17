using BookTracker.Application.DTOs;
using BookTracker.Application.Interfaces;
using BookTracker.Application.Services;
using BookTracker.Domain.Entities;
using BookTracker.Domain.Enums;
using Moq;
using System.Text.Json;

namespace BookTracker.Application.Tests;

public class LibraryServiceTests
{
    private readonly Mock<IUserBookRepository> _userBookRepositoryMock;
    private readonly Mock<IGoogleBooksService> _googleBooksServiceMock;
    private readonly LibraryService _libraryService;

    public LibraryServiceTests()
    {
        _userBookRepositoryMock = new Mock<IUserBookRepository>();
        _googleBooksServiceMock = new Mock<IGoogleBooksService>();
        _libraryService = new LibraryService(_userBookRepositoryMock.Object, _googleBooksServiceMock.Object);
    }

    [Fact]
    public async Task GetUserLibraryAsync_ReturnsBooks()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var books = new List<UserBook>
        {
            new UserBook
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                GoogleBooksId = "test123",
                Title = "Test Book",
                Authors = JsonSerializer.Serialize(new[] { "Author 1" }),
                Status = ReadingStatus.WantToRead,
                AddedAt = DateTime.UtcNow
            }
        };

        _userBookRepositoryMock.Setup(x => x.GetByUserIdAsync(userId, null))
            .ReturnsAsync(books);

        // Act
        var result = await _libraryService.GetUserLibraryAsync(userId);

        // Assert
        Assert.Single(result);
        Assert.Equal("Test Book", result.First().Title);
    }

    [Fact]
    public async Task AddBookToLibraryAsync_AddsNewBook()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var addBookDto = new AddBookDto("test123", ReadingStatus.WantToRead);
        var bookDetails = new BookDetailsDto(
            GoogleBooksId: "test123",
            Title: "Test Book",
            Authors: new List<string> { "Author 1" },
            Description: "Test description",
            CoverImageUrl: null,
            PageCount: 200,
            PublishedDate: "2024",
            Publisher: "Test Publisher",
            Categories: null
        );

        _userBookRepositoryMock.Setup(x => x.ExistsAsync(userId, "test123"))
            .ReturnsAsync(false);
        _googleBooksServiceMock.Setup(x => x.GetBookDetailsAsync("test123"))
            .ReturnsAsync(bookDetails);
        _userBookRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<UserBook>()))
            .ReturnsAsync((UserBook book) => book);

        // Act
        var result = await _libraryService.AddBookToLibraryAsync(userId, addBookDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Test Book", result.Title);
        Assert.Equal(ReadingStatus.WantToRead, result.Status);
    }

    [Fact]
    public async Task AddBookToLibraryAsync_ThrowsIfBookExists()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var addBookDto = new AddBookDto("test123", ReadingStatus.WantToRead);

        _userBookRepositoryMock.Setup(x => x.ExistsAsync(userId, "test123"))
            .ReturnsAsync(true);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _libraryService.AddBookToLibraryAsync(userId, addBookDto)
        );
    }

    [Fact]
    public async Task UpdateUserBookAsync_UpdatesStatus()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var bookId = Guid.NewGuid();
        var existingBook = new UserBook
        {
            Id = bookId,
            UserId = userId,
            GoogleBooksId = "test123",
            Title = "Test Book",
            Authors = "[]",
            Status = ReadingStatus.WantToRead,
            AddedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _userBookRepositoryMock.Setup(x => x.GetByIdAsync(userId, bookId))
            .ReturnsAsync(existingBook);
        _userBookRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<UserBook>()))
            .ReturnsAsync((UserBook book) => book);

        var updateDto = new UpdateBookDto(
            Status: ReadingStatus.CurrentlyReading,
            StartedAt: null,
            FinishedAt: null,
            Rating: null,
            Notes: null
        );

        // Act
        var result = await _libraryService.UpdateUserBookAsync(userId, bookId, updateDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(ReadingStatus.CurrentlyReading, result.Status);
    }

    [Fact]
    public async Task RemoveFromLibraryAsync_RemovesBook()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var bookId = Guid.NewGuid();

        _userBookRepositoryMock.Setup(x => x.DeleteAsync(userId, bookId))
            .ReturnsAsync(true);

        // Act
        var result = await _libraryService.RemoveFromLibraryAsync(userId, bookId);

        // Assert
        Assert.True(result);
        _userBookRepositoryMock.Verify(x => x.DeleteAsync(userId, bookId), Times.Once);
    }
}
