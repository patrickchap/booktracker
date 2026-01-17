using BookTracker.Application.DTOs;

namespace BookTracker.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> AuthenticateWithGoogleAsync(string idToken);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
    Task<UserDto?> GetCurrentUserAsync(Guid userId);
    Task RevokeRefreshTokenAsync(string refreshToken);
}
