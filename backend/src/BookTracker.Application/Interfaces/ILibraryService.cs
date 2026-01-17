using BookTracker.Application.DTOs;
using BookTracker.Domain.Enums;

namespace BookTracker.Application.Interfaces;

public interface ILibraryService
{
    Task<IEnumerable<UserBookDto>> GetUserLibraryAsync(Guid userId, ReadingStatus? status = null);
    Task<UserBookDto?> GetUserBookAsync(Guid userId, Guid bookId);
    Task<UserBookDto> AddBookToLibraryAsync(Guid userId, AddBookDto dto);
    Task<UserBookDto?> UpdateUserBookAsync(Guid userId, Guid bookId, UpdateBookDto dto);
    Task<bool> RemoveFromLibraryAsync(Guid userId, Guid bookId);
    Task<bool> IsBookInLibraryAsync(Guid userId, string googleBooksId);
}
