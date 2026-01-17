using BookTracker.Api.Controllers;
using BookTracker.Application.DTOs;
using BookTracker.Application.Interfaces;
using BookTracker.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;

namespace BookTracker.Api.Tests;

public class LibraryControllerTests
{
    private readonly Mock<ILibraryService> _libraryServiceMock;
    private readonly LibraryController _controller;
    private readonly Guid _testUserId = Guid.NewGuid();

    public LibraryControllerTests()
    {
        _libraryServiceMock = new Mock<ILibraryService>();
        _controller = new LibraryController(_libraryServiceMock.Object);

        // Setup user claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, _testUserId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    [Fact]
    public async Task GetLibrary_ReturnsOkWithBooks()
    {
        // Arrange
        var books = new List<UserBookDto>
        {
            new UserBookDto(
                Id: Guid.NewGuid(),
                GoogleBooksId: "test123",
                Title: "Test Book",
                Authors: new List<string> { "Author" },
                CoverImageUrl: null,
                Status: ReadingStatus.WantToRead,
                StartedAt: null,
                FinishedAt: null,
                Rating: null,
                Notes: null,
                AddedAt: DateTime.UtcNow
            )
        };

        _libraryServiceMock.Setup(x => x.GetUserLibraryAsync(_testUserId, null))
            .ReturnsAsync(books);

        // Act
        var result = await _controller.GetLibrary();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedBooks = Assert.IsAssignableFrom<IEnumerable<UserBookDto>>(okResult.Value);
        Assert.Single(returnedBooks);
    }

    [Fact]
    public async Task AddBook_ReturnsCreatedResult()
    {
        // Arrange
        var addBookDto = new AddBookDto("test123", ReadingStatus.WantToRead);
        var createdBook = new UserBookDto(
            Id: Guid.NewGuid(),
            GoogleBooksId: "test123",
            Title: "Test Book",
            Authors: new List<string> { "Author" },
            CoverImageUrl: null,
            Status: ReadingStatus.WantToRead,
            StartedAt: null,
            FinishedAt: null,
            Rating: null,
            Notes: null,
            AddedAt: DateTime.UtcNow
        );

        _libraryServiceMock.Setup(x => x.AddBookToLibraryAsync(_testUserId, addBookDto))
            .ReturnsAsync(createdBook);

        // Act
        var result = await _controller.AddBook(addBookDto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var returnedBook = Assert.IsType<UserBookDto>(createdResult.Value);
        Assert.Equal("test123", returnedBook.GoogleBooksId);
    }

    [Fact]
    public async Task AddBook_ReturnsBadRequestOnError()
    {
        // Arrange
        var addBookDto = new AddBookDto("test123", ReadingStatus.WantToRead);

        _libraryServiceMock.Setup(x => x.AddBookToLibraryAsync(_testUserId, addBookDto))
            .ThrowsAsync(new InvalidOperationException("Book already exists"));

        // Act
        var result = await _controller.AddBook(addBookDto);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetBook_ReturnsNotFoundForMissingBook()
    {
        // Arrange
        var bookId = Guid.NewGuid();

        _libraryServiceMock.Setup(x => x.GetUserBookAsync(_testUserId, bookId))
            .ReturnsAsync((UserBookDto?)null);

        // Act
        var result = await _controller.GetBook(bookId);

        // Assert
        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task RemoveBook_ReturnsNoContent()
    {
        // Arrange
        var bookId = Guid.NewGuid();

        _libraryServiceMock.Setup(x => x.RemoveFromLibraryAsync(_testUserId, bookId))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.RemoveBook(bookId);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task RemoveBook_ReturnsNotFoundForMissingBook()
    {
        // Arrange
        var bookId = Guid.NewGuid();

        _libraryServiceMock.Setup(x => x.RemoveFromLibraryAsync(_testUserId, bookId))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.RemoveBook(bookId);

        // Assert
        Assert.IsType<NotFoundObjectResult>(result);
    }
}
