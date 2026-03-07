using BookTracker.Api.Controllers;
using BookTracker.Application.DTOs;
using BookTracker.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;

namespace BookTracker.Api.Tests.Controllers;

public class BookClubsControllerTests
{
    private readonly Mock<IBookClubService> _bookClubServiceMock;
    private readonly BookClubsController _controller;
    private readonly Guid _testUserId = Guid.NewGuid();

    public BookClubsControllerTests()
    {
        _bookClubServiceMock = new Mock<IBookClubService>();
        _controller = new BookClubsController(_bookClubServiceMock.Object);
        SetHttpContext(_testUserId);
    }

    private void SetHttpContext(Guid userId)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    private void SetHttpContextWithoutUserClaim()
    {
        var principal = new ClaimsPrincipal(new ClaimsIdentity());
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    [Fact]
    public async Task GetMyClubs_ReturnsOk_WithClubList()
    {
        // Arrange
        var clubs = new List<BookClubSummaryDto>
        {
            new BookClubSummaryDto(Guid.NewGuid(), "Test Club", null, null, "Public", 3, null, Guid.Empty)
        };
        _bookClubServiceMock.Setup(x => x.GetMyClubsAsync(_testUserId)).ReturnsAsync(clubs);

        // Act
        var result = await _controller.GetMyClubs();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedClubs = Assert.IsAssignableFrom<List<BookClubSummaryDto>>(okResult.Value);
        Assert.Single(returnedClubs);
    }

    [Fact]
    public async Task GetMyClubs_ReturnsOk_EmptyList()
    {
        // Arrange
        _bookClubServiceMock.Setup(x => x.GetMyClubsAsync(_testUserId))
            .ReturnsAsync(new List<BookClubSummaryDto>());

        // Act
        var result = await _controller.GetMyClubs();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedClubs = Assert.IsAssignableFrom<List<BookClubSummaryDto>>(okResult.Value);
        Assert.Empty(returnedClubs);
    }

    [Fact]
    public async Task GetMyClubs_ReturnsUnauthorized_WhenUserIdClaimMissing()
    {
        // Arrange
        SetHttpContextWithoutUserClaim();

        // Act
        var result = await _controller.GetMyClubs();

        // Assert
        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public async Task GetPublicClubs_ReturnsOk_WithPaginatedClubs()
    {
        // Arrange
        var clubs = new List<BookClubSummaryDto>
        {
            new BookClubSummaryDto(Guid.NewGuid(), "Public Club", null, null, "Public", 10, null, Guid.Empty)
        };
        _bookClubServiceMock.Setup(x => x.GetPublicClubsAsync(_testUserId, 1, 20))
            .ReturnsAsync(clubs);

        // Act
        var result = await _controller.GetPublicClubs();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedClubs = Assert.IsAssignableFrom<List<BookClubSummaryDto>>(okResult.Value);
        Assert.Single(returnedClubs);
    }

    [Fact]
    public async Task GetPublicClubs_ReturnsOk_WithCustomPagination()
    {
        // Arrange
        _bookClubServiceMock.Setup(x => x.GetPublicClubsAsync(_testUserId, 2, 5))
            .ReturnsAsync(new List<BookClubSummaryDto>());

        // Act
        var result = await _controller.GetPublicClubs(page: 2, pageSize: 5);

        // Assert
        Assert.IsType<OkObjectResult>(result.Result);
        _bookClubServiceMock.Verify(x => x.GetPublicClubsAsync(_testUserId, 2, 5), Times.Once);
    }

    [Fact]
    public async Task GetPublicClubs_ReturnsUnauthorized_WhenUserIdClaimMissing()
    {
        // Arrange
        SetHttpContextWithoutUserClaim();

        // Act
        var result = await _controller.GetPublicClubs();

        // Assert
        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public async Task CreateClub_ReturnsCreated_WithNewClub()
    {
        // Arrange
        var request = new CreateBookClubRequest("My Club", "Public", new List<Guid>());
        var club = new BookClubSummaryDto(Guid.NewGuid(), "My Club", null, null, "Public", 1, null, Guid.Empty);
        _bookClubServiceMock.Setup(x => x.CreateClubAsync(_testUserId, request)).ReturnsAsync(club);

        // Act
        var result = await _controller.CreateClub(request);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var returnedClub = Assert.IsType<BookClubSummaryDto>(createdResult.Value);
        Assert.Equal("My Club", returnedClub.Name);
    }

    [Fact]
    public async Task CreateClub_ReturnsUnauthorized_WhenUserIdClaimMissing()
    {
        // Arrange
        SetHttpContextWithoutUserClaim();
        var request = new CreateBookClubRequest("My Club", "Public", new List<Guid>());

        // Act
        var result = await _controller.CreateClub(request);

        // Assert
        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public async Task DeleteClub_ReturnsNoContent_WhenSuccess()
    {
        // Arrange
        var clubId = Guid.NewGuid();
        _bookClubServiceMock.Setup(x => x.DeleteClubAsync(_testUserId, clubId)).Returns(Task.CompletedTask);

        // Act
        var result = await _controller.DeleteClub(clubId);

        // Assert
        Assert.IsType<NoContentResult>(result);
        _bookClubServiceMock.Verify(x => x.DeleteClubAsync(_testUserId, clubId), Times.Once);
    }

    [Fact]
    public async Task DeleteClub_ReturnsUnauthorized_WhenUserIdClaimMissing()
    {
        // Arrange
        SetHttpContextWithoutUserClaim();

        // Act
        var result = await _controller.DeleteClub(Guid.NewGuid());

        // Assert
        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task SearchUsers_ReturnsOk_WithUsers()
    {
        // Arrange
        var users = new List<UserSearchResultDto>
        {
            new UserSearchResultDto(Guid.NewGuid(), "Alice", "alice@example.com", null)
        };
        _bookClubServiceMock.Setup(x => x.SearchUsersAsync("alice", _testUserId)).ReturnsAsync(users);

        // Act
        var result = await _controller.SearchUsers("alice");

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedUsers = Assert.IsAssignableFrom<List<UserSearchResultDto>>(okResult.Value);
        Assert.Single(returnedUsers);
    }

    [Fact]
    public async Task SearchUsers_ReturnsEmptyList_WhenQueryIsEmpty()
    {
        // Act
        var result = await _controller.SearchUsers("");

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedUsers = Assert.IsAssignableFrom<List<UserSearchResultDto>>(okResult.Value);
        Assert.Empty(returnedUsers);
        _bookClubServiceMock.Verify(x => x.SearchUsersAsync(It.IsAny<string>(), It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task SearchUsers_ReturnsUnauthorized_WhenUserIdClaimMissing()
    {
        // Arrange
        SetHttpContextWithoutUserClaim();

        // Act
        var result = await _controller.SearchUsers("alice");

        // Assert
        Assert.IsType<UnauthorizedResult>(result.Result);
    }
}
