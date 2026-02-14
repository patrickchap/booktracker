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
    public DbSet<BookClub> BookClubs => Set<BookClub>();
    public DbSet<ClubMember> ClubMembers => Set<ClubMember>();
    public DbSet<ClubBook> ClubBooks => Set<ClubBook>();

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

        modelBuilder.Entity<BookClub>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.CoverImageUrl).HasMaxLength(500);
            entity.Property(e => e.InviteCode).IsRequired().HasMaxLength(8);

            entity.HasIndex(e => e.InviteCode).IsUnique();

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(e => e.Members)
                .WithOne(e => e.BookClub)
                .HasForeignKey(e => e.BookClubId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Books)
                .WithOne(e => e.BookClub)
                .HasForeignKey(e => e.BookClubId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ClubMember>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasIndex(e => new { e.BookClubId, e.UserId }).IsUnique();

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ClubBook>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.GoogleBooksId).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Authors).HasMaxLength(1000);
            entity.Property(e => e.CoverImageUrl).HasMaxLength(500);

            entity.HasIndex(e => new { e.BookClubId, e.GoogleBooksId }).IsUnique();

            entity.HasOne(e => e.SelectedByUser)
                .WithMany()
                .HasForeignKey(e => e.SelectedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
