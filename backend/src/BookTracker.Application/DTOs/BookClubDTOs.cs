namespace BookTracker.Application.DTOs;

public record CurrentBookDto(
    string Title,
    string? CoverImageUrl,
    List<string> Authors
);

public record BookClubSummaryDto(
    Guid Id,
    string Name,
    string? Description,
    string? CoverImageUrl,
    string Privacy,
    int MemberCount,
    CurrentBookDto? CurrentBook,
    Guid CreatedByUserId
);

public record CreateBookClubRequest(
    string Name,
    string Privacy,
    List<Guid> InvitedUserIds
);

public record UserSearchResultDto(
    Guid Id,
    string DisplayName,
    string Email,
    string? AvatarUrl
);
