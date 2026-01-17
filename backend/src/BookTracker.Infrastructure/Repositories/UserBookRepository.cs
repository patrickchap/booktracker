using BookTracker.Application.Interfaces;
using BookTracker.Domain.Entities;
using BookTracker.Domain.Enums;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Repositories;

public class UserBookRepository : IUserBookRepository
{
    private readonly BookTrackerDbContext _context;

    public UserBookRepository(BookTrackerDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<UserBook>> GetByUserIdAsync(Guid userId, ReadingStatus? status = null)
    {
        var query = _context.UserBooks.Where(ub => ub.UserId == userId);

        if (status.HasValue)
        {
            query = query.Where(ub => ub.Status == status.Value);
        }

        return await query.OrderByDescending(ub => ub.AddedAt).ToListAsync();
    }

    public async Task<UserBook?> GetByIdAsync(Guid userId, Guid bookId)
    {
        return await _context.UserBooks
            .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.Id == bookId);
    }

    public async Task<UserBook?> GetByGoogleBooksIdAsync(Guid userId, string googleBooksId)
    {
        return await _context.UserBooks
            .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.GoogleBooksId == googleBooksId);
    }

    public async Task<UserBook> CreateAsync(UserBook userBook)
    {
        userBook.Id = Guid.NewGuid();
        userBook.AddedAt = DateTime.UtcNow;
        userBook.UpdatedAt = DateTime.UtcNow;
        _context.UserBooks.Add(userBook);
        await _context.SaveChangesAsync();
        return userBook;
    }

    public async Task<UserBook> UpdateAsync(UserBook userBook)
    {
        userBook.UpdatedAt = DateTime.UtcNow;
        _context.UserBooks.Update(userBook);
        await _context.SaveChangesAsync();
        return userBook;
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid bookId)
    {
        var userBook = await GetByIdAsync(userId, bookId);
        if (userBook == null) return false;

        _context.UserBooks.Remove(userBook);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(Guid userId, string googleBooksId)
    {
        return await _context.UserBooks
            .AnyAsync(ub => ub.UserId == userId && ub.GoogleBooksId == googleBooksId);
    }
}
