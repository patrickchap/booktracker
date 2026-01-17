using System.Text.Json;
using BookTracker.Application.DTOs;
using BookTracker.Application.Interfaces;
using BookTracker.Domain.Entities;
using BookTracker.Domain.Enums;

namespace BookTracker.Application.Services;

public class LibraryService : ILibraryService
{
    private readonly IUserBookRepository _userBookRepository;
    private readonly IGoogleBooksService _googleBooksService;

    public LibraryService(IUserBookRepository userBookRepository, IGoogleBooksService googleBooksService)
    {
        _userBookRepository = userBookRepository;
        _googleBooksService = googleBooksService;
    }

    public async Task<IEnumerable<UserBookDto>> GetUserLibraryAsync(Guid userId, ReadingStatus? status = null)
    {
        var books = await _userBookRepository.GetByUserIdAsync(userId, status);
        return books.Select(MapToDto);
    }

    public async Task<UserBookDto?> GetUserBookAsync(Guid userId, Guid bookId)
    {
        var book = await _userBookRepository.GetByIdAsync(userId, bookId);
        return book == null ? null : MapToDto(book);
    }

    public async Task<UserBookDto> AddBookToLibraryAsync(Guid userId, AddBookDto dto)
    {
        if (await _userBookRepository.ExistsAsync(userId, dto.GoogleBooksId))
        {
            throw new InvalidOperationException("Book already exists in library");
        }

        var bookDetails = await _googleBooksService.GetBookDetailsAsync(dto.GoogleBooksId)
            ?? throw new InvalidOperationException("Book not found in Google Books");

        var userBook = new UserBook
        {
            UserId = userId,
            GoogleBooksId = dto.GoogleBooksId,
            Title = bookDetails.Title,
            Authors = JsonSerializer.Serialize(bookDetails.Authors),
            CoverImageUrl = bookDetails.CoverImageUrl,
            Description = bookDetails.Description,
            PageCount = bookDetails.PageCount,
            PublishedDate = bookDetails.PublishedDate,
            Status = dto.Status
        };

        if (dto.Status == ReadingStatus.CurrentlyReading)
        {
            userBook.StartedAt = DateTime.UtcNow;
        }
        else if (dto.Status == ReadingStatus.Finished)
        {
            userBook.StartedAt = DateTime.UtcNow;
            userBook.FinishedAt = DateTime.UtcNow;
        }

        var created = await _userBookRepository.CreateAsync(userBook);
        return MapToDto(created);
    }

    public async Task<UserBookDto?> UpdateUserBookAsync(Guid userId, Guid bookId, UpdateBookDto dto)
    {
        var book = await _userBookRepository.GetByIdAsync(userId, bookId);
        if (book == null) return null;

        if (dto.Status.HasValue)
        {
            var oldStatus = book.Status;
            book.Status = dto.Status.Value;

            if (oldStatus != ReadingStatus.CurrentlyReading && dto.Status == ReadingStatus.CurrentlyReading)
            {
                book.StartedAt ??= DateTime.UtcNow;
            }

            if (dto.Status == ReadingStatus.Finished && !book.FinishedAt.HasValue)
            {
                book.FinishedAt = DateTime.UtcNow;
            }
        }

        if (dto.StartedAt.HasValue)
            book.StartedAt = dto.StartedAt;

        if (dto.FinishedAt.HasValue)
            book.FinishedAt = dto.FinishedAt;

        if (dto.Rating.HasValue)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
                throw new ArgumentException("Rating must be between 1 and 5");
            book.Rating = dto.Rating;
        }

        if (dto.Notes != null)
            book.Notes = dto.Notes;

        var updated = await _userBookRepository.UpdateAsync(book);
        return MapToDto(updated);
    }

    public async Task<bool> RemoveFromLibraryAsync(Guid userId, Guid bookId)
    {
        return await _userBookRepository.DeleteAsync(userId, bookId);
    }

    public async Task<bool> IsBookInLibraryAsync(Guid userId, string googleBooksId)
    {
        return await _userBookRepository.ExistsAsync(userId, googleBooksId);
    }

    private static UserBookDto MapToDto(UserBook book)
    {
        var authors = string.IsNullOrEmpty(book.Authors)
            ? new List<string>()
            : JsonSerializer.Deserialize<List<string>>(book.Authors) ?? new List<string>();

        return new UserBookDto(
            Id: book.Id,
            GoogleBooksId: book.GoogleBooksId,
            Title: book.Title,
            Authors: authors,
            CoverImageUrl: book.CoverImageUrl,
            Status: book.Status,
            StartedAt: book.StartedAt,
            FinishedAt: book.FinishedAt,
            Rating: book.Rating,
            Notes: book.Notes,
            AddedAt: book.AddedAt
        );
    }
}
