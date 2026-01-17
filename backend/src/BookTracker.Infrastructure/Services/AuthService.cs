using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using BookTracker.Application.DTOs;
using BookTracker.Application.Interfaces;
using BookTracker.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace BookTracker.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ICacheService _cacheService;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        ICacheService cacheService,
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _cacheService = cacheService;
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AuthResponseDto> AuthenticateWithGoogleAsync(string idToken)
    {
        var googleUser = await ValidateGoogleTokenAsync(idToken)
            ?? throw new UnauthorizedAccessException("Invalid Google token");

        var user = await _userRepository.GetByGoogleIdAsync(googleUser.GoogleId);

        if (user == null)
        {
            user = new User
            {
                GoogleId = googleUser.GoogleId,
                Email = googleUser.Email,
                DisplayName = googleUser.Name,
                AvatarUrl = googleUser.Picture
            };
            user = await _userRepository.CreateAsync(user);
        }
        else
        {
            user.DisplayName = googleUser.Name;
            user.AvatarUrl = googleUser.Picture;
            user = await _userRepository.UpdateAsync(user);
        }

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var userId = await _cacheService.GetAsync<string>($"refresh:{refreshToken}");
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token");
        }

        var user = await _userRepository.GetByIdAsync(Guid.Parse(userId))
            ?? throw new UnauthorizedAccessException("User not found");

        await _cacheService.RemoveAsync($"refresh:{refreshToken}");

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<UserDto?> GetCurrentUserAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return null;

        return new UserDto(user.Id, user.Email, user.DisplayName, user.AvatarUrl);
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken)
    {
        await _cacheService.RemoveAsync($"refresh:{refreshToken}");
    }

    private async Task<GoogleUserInfo?> ValidateGoogleTokenAsync(string idToken)
    {
        try
        {
            var response = await _httpClient.GetAsync(
                $"https://oauth2.googleapis.com/tokeninfo?id_token={idToken}");

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Google token validation failed");
                return null;
            }

            var json = await response.Content.ReadFromJsonAsync<JsonElement>();

            var clientId = _configuration["Authentication:Google:ClientId"];
            var aud = json.TryGetProperty("aud", out var audProp) ? audProp.GetString() : null;

            if (aud != clientId)
            {
                _logger.LogWarning("Token audience mismatch");
                return null;
            }

            return new GoogleUserInfo
            {
                GoogleId = json.TryGetProperty("sub", out var sub) ? sub.GetString() ?? "" : "",
                Email = json.TryGetProperty("email", out var email) ? email.GetString() ?? "" : "",
                Name = json.TryGetProperty("name", out var name) ? name.GetString() ?? "" : "",
                Picture = json.TryGetProperty("picture", out var picture) ? picture.GetString() : null
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating Google token");
            return null;
        }
    }

    private async Task<AuthResponseDto> GenerateAuthResponseAsync(User user)
    {
        var jwtSecret = _configuration["Authentication:Jwt:Secret"]
            ?? throw new InvalidOperationException("JWT secret not configured");
        var issuer = _configuration["Authentication:Jwt:Issuer"] ?? "BookTracker";
        var audience = _configuration["Authentication:Jwt:Audience"] ?? "BookTracker";
        var expirationMinutes = int.Parse(_configuration["Authentication:Jwt:ExpirationMinutes"] ?? "60");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("name", user.DisplayName)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
        var refreshToken = GenerateRefreshToken();

        await _cacheService.SetAsync(
            $"refresh:{refreshToken}",
            user.Id.ToString(),
            TimeSpan.FromDays(7));

        return new AuthResponseDto(
            AccessToken: accessToken,
            RefreshToken: refreshToken,
            ExpiresAt: expiresAt,
            User: new UserDto(user.Id, user.Email, user.DisplayName, user.AvatarUrl)
        );
    }

    private static string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    private class GoogleUserInfo
    {
        public string GoogleId { get; set; } = "";
        public string Email { get; set; } = "";
        public string Name { get; set; } = "";
        public string? Picture { get; set; }
    }
}
