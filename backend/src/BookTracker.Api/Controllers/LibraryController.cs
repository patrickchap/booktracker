using System.Security.Claims;
using BookTracker.Application.DTOs;
using BookTracker.Application.Interfaces;
using BookTracker.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LibraryController : ControllerBase
{
    private readonly ILibraryService _libraryService;

    public LibraryController(ILibraryService libraryService)
    {
        _libraryService = libraryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserBookDto>>> GetLibrary([FromQuery] ReadingStatus? status = null)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var books = await _libraryService.GetUserLibraryAsync(userId.Value, status);
        return Ok(books);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserBookDto>> GetBook(Guid id)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var book = await _libraryService.GetUserBookAsync(userId.Value, id);
        if (book == null)
        {
            return NotFound(new { message = "Book not found in library" });
        }

        return Ok(book);
    }

    [HttpPost]
    public async Task<ActionResult<UserBookDto>> AddBook([FromBody] AddBookDto dto)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        try
        {
            var book = await _libraryService.AddBookToLibraryAsync(userId.Value, dto);
            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, book);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UserBookDto>> UpdateBook(Guid id, [FromBody] UpdateBookDto dto)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        try
        {
            var book = await _libraryService.UpdateUserBookAsync(userId.Value, id, dto);
            if (book == null)
            {
                return NotFound(new { message = "Book not found in library" });
            }

            return Ok(book);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> RemoveBook(Guid id)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await _libraryService.RemoveFromLibraryAsync(userId.Value, id);
        if (!result)
        {
            return NotFound(new { message = "Book not found in library" });
        }

        return NoContent();
    }

    [HttpGet("check/{googleBooksId}")]
    public async Task<ActionResult<object>> CheckBookInLibrary(string googleBooksId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var exists = await _libraryService.IsBookInLibraryAsync(userId.Value, googleBooksId);
        return Ok(new { inLibrary = exists });
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
