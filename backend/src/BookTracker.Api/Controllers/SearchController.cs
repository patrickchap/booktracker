using BookTracker.Application.DTOs;
using BookTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SearchController : ControllerBase
{
    private readonly IGoogleBooksService _googleBooksService;

    public SearchController(IGoogleBooksService googleBooksService)
    {
        _googleBooksService = googleBooksService;
    }

    [HttpGet]
    public async Task<ActionResult<SearchResponseDto>> Search(
        [FromQuery] string q,
        [FromQuery] int startIndex = 0,
        [FromQuery] int maxResults = 20)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return BadRequest(new { message = "Search query is required" });
        }

        if (maxResults < 1 || maxResults > 40)
        {
            maxResults = 20;
        }

        var results = await _googleBooksService.SearchBooksAsync(q, startIndex, maxResults);
        return Ok(results);
    }
}
