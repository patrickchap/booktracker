using BookTracker.Application.DTOs;

namespace BookTracker.Application.Interfaces;

public interface IBookClubService
{
    Task<BookClubSummaryDto?> GetClubByIdAsync(Guid userId, Guid clubId);
    Task<List<BookClubSummaryDto>> GetMyClubsAsync(Guid userId);
    Task<List<BookClubSummaryDto>> GetPublicClubsAsync(Guid userId, int page, int pageSize);
    Task<BookClubSummaryDto> CreateClubAsync(Guid userId, CreateBookClubRequest request);
    Task<List<UserSearchResultDto>> SearchUsersAsync(string query, Guid currentUserId);
    Task DeleteClubAsync(Guid userId, Guid clubId);
}
