using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TalentSphereAPI.Migrations
{
    /// <inheritdoc />
    /// Adds a nullable LogoUrl to Organizations. Additive only: existing
    /// organizations are unchanged (they simply have no logo).
    public partial class AddOrganizationLogoUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LogoUrl",
                table: "Organizations",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LogoUrl",
                table: "Organizations");
        }
    }
}
