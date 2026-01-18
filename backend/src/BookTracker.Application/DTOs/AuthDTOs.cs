namespace BookTracker.Application.DTOs;

public record GoogleTokenDto(string IdToken);

public record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserDto User
);

// Hybrid response: access token in body, refresh token in HttpOnly cookie
public record AuthUserResponseDto(
    string AccessToken,
    DateTime ExpiresAt,
    UserDto User
);

public record UserDto(
    Guid Id,
    string Email,
    string DisplayName,
    string? AvatarUrl
);
