using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TalentSphereAPI.Migrations
{
    /// <inheritdoc />
    /// Adds a nullable PosterUrl to Courses. Additive only: existing courses,
    /// IDs and fees are unchanged (they simply have no poster).
    public partial class AddCoursePosterUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PosterUrl",
                table: "Courses",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PosterUrl",
                table: "Courses");
        }
    }
}
