using BookTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Data;

public class BookTrackerDbContext : DbContext
{
    public BookTrackerDbContext(DbContextOptions<BookTrackerDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserBook> UserBooks => Set<UserBook>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.GoogleId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.DisplayName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.AvatarUrl).HasMaxLength(500);

            entity.HasIndex(e => e.GoogleId).IsUnique();
            entity.HasIndex(e => e.Email);

            entity.HasMany(e => e.UserBooks)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserBook>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.GoogleBooksId).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Authors).HasMaxLength(1000);
            entity.Property(e => e.CoverImageUrl).HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(10000);
            entity.Property(e => e.PublishedDate).HasMaxLength(50);
            entity.Property(e => e.Notes).HasMaxLength(5000);

            entity.HasIndex(e => new { e.UserId, e.Status });
            entity.HasIndex(e => new { e.UserId, e.GoogleBooksId }).IsUnique();
        });
    }
}
