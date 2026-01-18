using System.Security.Claims;
using System.Threading.RateLimiting;
using BookTracker.Application.DTOs;
using BookTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace BookTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IWebHostEnvironment _environment;

    private const string RefreshTokenCookie = "refreshToken";

    public AuthController(IAuthService authService, IWebHostEnvironment environment)
    {
        _authService = authService;
        _environment = environment;
    }

    [EnableRateLimiting("auth")]
    [HttpPost("google")]
    public async Task<ActionResult<AuthUserResponseDto>> LoginWithGoogle([FromBody] GoogleTokenDto dto)
    {
        try
        {
            var result = await _authService.AuthenticateWithGoogleAsync(dto.IdToken);
            SetRefreshTokenCookie(result.RefreshToken);
            return Ok(new AuthUserResponseDto(result.AccessToken, result.ExpiresAt, result.User));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "Invalid Google token" });
        }
    }

    [EnableRateLimiting("auth")]
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthUserResponseDto>> RefreshToken()
    {
        var refreshToken = Request.Cookies[RefreshTokenCookie];
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(new { message = "No refresh token provided" });
        }

        try
        {
            var result = await _authService.RefreshTokenAsync(refreshToken);
            SetRefreshTokenCookie(result.RefreshToken);
            return Ok(new AuthUserResponseDto(result.AccessToken, result.ExpiresAt, result.User));
        }
        catch (UnauthorizedAccessException)
        {
            ClearRefreshTokenCookie();
            return Unauthorized(new { message = "Invalid or expired refresh token" });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _authService.GetCurrentUserAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var refreshToken = Request.Cookies[RefreshTokenCookie];
        if (!string.IsNullOrEmpty(refreshToken))
        {
            await _authService.RevokeRefreshTokenAsync(refreshToken);
        }
        ClearRefreshTokenCookie();
        return NoContent();
    }

    private void SetRefreshTokenCookie(string refreshToken)
    {
        var isProduction = !_environment.IsDevelopment();
        // Use Lax in development for cross-origin localhost requests, Strict in production
        var sameSite = isProduction ? SameSiteMode.Strict : SameSiteMode.Lax;

        var options = new CookieOptions
        {
            HttpOnly = true,
            Secure = isProduction,
            SameSite = sameSite,
            Expires = DateTime.UtcNow.AddDays(30),
            Path = "/"
        };

        Response.Cookies.Append(RefreshTokenCookie, refreshToken, options);
    }

    private void ClearRefreshTokenCookie()
    {
        var isProduction = !_environment.IsDevelopment();
        var sameSite = isProduction ? SameSiteMode.Strict : SameSiteMode.Lax;

        Response.Cookies.Append(RefreshTokenCookie, "", new CookieOptions
        {
            HttpOnly = true,
            Secure = isProduction,
            SameSite = sameSite,
            Expires = DateTime.UtcNow.AddDays(-1),
            Path = "/"
        });
    }
}
