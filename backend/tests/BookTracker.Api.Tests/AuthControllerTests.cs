using BookTracker.Api.Controllers;
using BookTracker.Application.DTOs;
using BookTracker.Application.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace BookTracker.Api.Tests;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _authServiceMock;
    private readonly Mock<IWebHostEnvironment> _environmentMock;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _authServiceMock = new Mock<IAuthService>();
        _environmentMock = new Mock<IWebHostEnvironment>();
        _environmentMock.Setup(e => e.EnvironmentName).Returns("Development");

        _controller = new AuthController(_authServiceMock.Object, _environmentMock.Object);
        SetHttpContext();
    }

    private void SetHttpContext(string? refreshTokenCookie = null)
    {
        var context = new DefaultHttpContext();
        if (refreshTokenCookie != null)
            context.Request.Headers["Cookie"] = $"refreshToken={refreshTokenCookie}";
        _controller.ControllerContext = new ControllerContext { HttpContext = context };
    }

    private AuthResponseDto MakeAuthResponse() =>
        new(
            AccessToken: "access-token",
            RefreshToken: "refresh-token",
            ExpiresAt: DateTime.UtcNow.AddHours(1),
            User: new UserDto(Guid.NewGuid(), "test@test.com", "Test User", null)
        );

    [Fact]
    public async Task LoginWithGoogle_ReturnsOk_WhenAuthServiceSucceeds()
    {
        var authResponse = MakeAuthResponse();
        _authServiceMock.Setup(x => x.AuthenticateWithGoogleAsync("id-token"))
            .ReturnsAsync(authResponse);

        var result = await _controller.LoginWithGoogle(new GoogleTokenDto("id-token"));

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<AuthUserResponseDto>(okResult.Value);
        Assert.Equal(authResponse.AccessToken, dto.AccessToken);

        var setCookie = _controller.HttpContext.Response.Headers["Set-Cookie"].ToString();
        Assert.Contains("refreshToken=refresh-token", setCookie);
    }

    [Fact]
    public async Task LoginWithGoogle_PropagatesUnauthorizedAccessException()
    {
        _authServiceMock.Setup(x => x.AuthenticateWithGoogleAsync(It.IsAny<string>()))
            .ThrowsAsync(new UnauthorizedAccessException());

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _controller.LoginWithGoogle(new GoogleTokenDto("id-token")));
    }

    [Fact]
    public async Task RefreshToken_ReturnsUnauthorized_WhenNoCookieProvided()
    {
        var result = await _controller.RefreshToken();

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result.Result);
        Assert.NotNull(unauthorized.Value);
    }

    [Fact]
    public async Task RefreshToken_ReturnsOk_WhenTokenValid()
    {
        SetHttpContext("existing-token");
        var authResponse = MakeAuthResponse();
        _authServiceMock.Setup(x => x.RefreshTokenAsync("existing-token"))
            .ReturnsAsync(authResponse);

        var result = await _controller.RefreshToken();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.IsType<AuthUserResponseDto>(okResult.Value);

        var setCookie = _controller.HttpContext.Response.Headers["Set-Cookie"].ToString();
        Assert.Contains("refreshToken=refresh-token", setCookie);
    }

    [Fact]
    public async Task RefreshToken_ClearsCookie_AndRethrows_WhenUnauthorizedAccessExceptionThrown()
    {
        SetHttpContext("bad-token");
        _authServiceMock.Setup(x => x.RefreshTokenAsync("bad-token"))
            .ThrowsAsync(new UnauthorizedAccessException());

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _controller.RefreshToken());

        // Cookie should be cleared (expires= present indicates expiry was set)
        var setCookie = _controller.HttpContext.Response.Headers["Set-Cookie"].ToString();
        Assert.Contains("refreshToken=", setCookie);
        Assert.Contains("expires=", setCookie.ToLower());
    }
}
