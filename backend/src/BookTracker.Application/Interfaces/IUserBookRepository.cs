using BookTracker.Domain.Entities;
using BookTracker.Domain.Enums;

namespace BookTracker.Application.Interfaces;

public interface IUserBookRepository
{
    Task<IEnumerable<UserBook>> GetByUserIdAsync(Guid userId, ReadingStatus? status = null);
    Task<UserBook?> GetByIdAsync(Guid userId, Guid bookId);
    Task<UserBook?> GetByGoogleBooksIdAsync(Guid userId, string googleBooksId);
    Task<UserBook> CreateAsync(UserBook userBook);
    Task<UserBook> UpdateAsync(UserBook userBook);
    Task<bool> DeleteAsync(Guid userId, Guid bookId);
    Task<bool> ExistsAsync(Guid userId, string googleBooksId);
}
