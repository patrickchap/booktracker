using BookTracker.Application.DTOs;
using BookTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace BookTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BooksController : ControllerBase
{
    private readonly IGoogleBooksService _googleBooksService;

    public BooksController(IGoogleBooksService googleBooksService)
    {
          _googleBooksService = googleBooksService;
    }

    [EnableRateLimiting("external-api")]
    [HttpGet("{googleBooksId}")]
    public async Task<ActionResult<BookDetailsDto>> GetBookDetails(string googleBooksId)
    {
        var book = await _googleBooksService.GetBookDetailsAsync(googleBooksId);

        if (book == null)
        {
            return NotFound(new { message = "Book not found" });
        }

        return Ok(book);
    }
}
