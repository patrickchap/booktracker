using System.Security.Claims;
using BookTracker.Application.DTOs;
using BookTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace BookTracker.Api.Controllers;

[ApiController]
[Route("api/clubs")]
[Authorize]
[EnableRateLimiting("general")]
public class BookClubsController : ControllerBase
{
    private readonly IBookClubService _bookClubService;

    public BookClubsController(IBookClubService bookClubService)
    {
        _bookClubService = bookClubService;
    }

    [HttpGet("mine")]
    public async Task<ActionResult<List<BookClubSummaryDto>>> GetMyClubs()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var clubs = await _bookClubService.GetMyClubsAsync(userId.Value);
        return Ok(clubs);
    }

    [HttpGet("public")]
    public async Task<ActionResult<List<BookClubSummaryDto>>> GetPublicClubs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var clubs = await _bookClubService.GetPublicClubsAsync(userId.Value, page, pageSize);
        return Ok(clubs);
    }

    [HttpPost]
    public async Task<ActionResult<BookClubSummaryDto>> CreateClub([FromBody] CreateBookClubRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var club = await _bookClubService.CreateClubAsync(userId.Value, request);
        return CreatedAtAction(nameof(CreateClub), new { id = club.Id }, club);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BookClubSummaryDto>> GetClub(Guid id)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var club = await _bookClubService.GetClubByIdAsync(userId.Value, id);
        if (club == null) return NotFound();
        return Ok(club);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteClub(Guid id)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        try
        {
            await _bookClubService.DeleteClubAsync(userId.Value, id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(StatusCodes.Status403Forbidden);
        }
    }

    [HttpGet("users/search")]
    public async Task<ActionResult<List<UserSearchResultDto>>> SearchUsers([FromQuery] string q)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(q))
            return Ok(new List<UserSearchResultDto>());

        var users = await _bookClubService.SearchUsersAsync(q, userId.Value);
        return Ok(users);
    }

    private Guid? GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return null;
        }
        return userId;
    }
}
