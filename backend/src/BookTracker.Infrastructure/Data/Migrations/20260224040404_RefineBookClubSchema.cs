using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookTracker.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RefineBookClubSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookNominations_Users_NominatedByUserId",
                table: "BookNominations");

            migrationBuilder.DropForeignKey(
                name: "FK_BookVotes_Users_UserId",
                table: "BookVotes");

            migrationBuilder.DropForeignKey(
                name: "FK_ClubMembers_Users_UserId",
                table: "ClubMembers");

            migrationBuilder.DropForeignKey(
                name: "FK_DiscussionPosts_Users_AuthorUserId",
                table: "DiscussionPosts");

            migrationBuilder.DropForeignKey(
                name: "FK_Discussions_Users_CreatedByUserId",
                table: "Discussions");

            migrationBuilder.DropIndex(
                name: "IX_BookNominations_ClubBookId",
                table: "BookNominations");

            migrationBuilder.AlterColumn<int>(
                name: "RoundRobinOrder",
                table: "ClubMembers",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.CreateIndex(
                name: "IX_BookNominations_ClubBookId_NominatedByUserId",
                table: "BookNominations",
                columns: new[] { "ClubBookId", "NominatedByUserId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BookNominations_Users_NominatedByUserId",
                table: "BookNominations",
                column: "NominatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BookVotes_Users_UserId",
                table: "BookVotes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ClubMembers_Users_UserId",
                table: "ClubMembers",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DiscussionPosts_Users_AuthorUserId",
                table: "DiscussionPosts",
                column: "AuthorUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Discussions_Users_CreatedByUserId",
                table: "Discussions",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookNominations_Users_NominatedByUserId",
                table: "BookNominations");

            migrationBuilder.DropForeignKey(
                name: "FK_BookVotes_Users_UserId",
                table: "BookVotes");

            migrationBuilder.DropForeignKey(
                name: "FK_ClubMembers_Users_UserId",
                table: "ClubMembers");

            migrationBuilder.DropForeignKey(
                name: "FK_DiscussionPosts_Users_AuthorUserId",
                table: "DiscussionPosts");

            migrationBuilder.DropForeignKey(
                name: "FK_Discussions_Users_CreatedByUserId",
                table: "Discussions");

            migrationBuilder.DropIndex(
                name: "IX_BookNominations_ClubBookId_NominatedByUserId",
                table: "BookNominations");

            migrationBuilder.AlterColumn<int>(
                name: "RoundRobinOrder",
                table: "ClubMembers",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BookNominations_ClubBookId",
                table: "BookNominations",
                column: "ClubBookId");

            migrationBuilder.AddForeignKey(
                name: "FK_BookNominations_Users_NominatedByUserId",
                table: "BookNominations",
                column: "NominatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BookVotes_Users_UserId",
                table: "BookVotes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ClubMembers_Users_UserId",
                table: "ClubMembers",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DiscussionPosts_Users_AuthorUserId",
                table: "DiscussionPosts",
                column: "AuthorUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Discussions_Users_CreatedByUserId",
                table: "Discussions",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
