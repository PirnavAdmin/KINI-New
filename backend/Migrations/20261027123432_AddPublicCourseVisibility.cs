
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TalentSphereAPI.Migrations
{
    public partial class AddPublicCourseVisibility : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Existing database objects:
            // Courses.IsArchived
            // Courses.IsPublic
            // LiveClasses.ModuleId, its index and foreign key
            // BatchModuleCompletions and its indexes
            // get_in_touches
            // registrations

            // Create the CreatedDate index only if it is missing.
            migrationBuilder.Sql(
                """
                SET @idx_exists = (
                    SELECT COUNT(*)
                    FROM INFORMATION_SCHEMA.STATISTICS
                    WHERE TABLE_SCHEMA = DATABASE()
                      AND TABLE_NAME = 'get_in_touches'
                      AND INDEX_NAME = 'IX_get_in_touches_CreatedDate'
                );

                SET @ddl = IF(
                    @idx_exists = 0,
                    'CREATE INDEX `IX_get_in_touches_CreatedDate` ON `get_in_touches` (`CreatedDate`)',
                    'SELECT 1'
                );

                PREPARE migration_stmt FROM @ddl;
                EXECUTE migration_stmt;
                DEALLOCATE PREPARE migration_stmt;
                """);

            // Create the unique Email index only if it is missing.
            migrationBuilder.Sql(
                """
                SET @idx_exists = (
                    SELECT COUNT(*)
                    FROM INFORMATION_SCHEMA.STATISTICS
                    WHERE TABLE_SCHEMA = DATABASE()
                      AND TABLE_NAME = 'registrations'
                      AND INDEX_NAME = 'IX_registrations_Email'
                );

                SET @ddl = IF(
                    @idx_exists = 0,
                    'CREATE UNIQUE INDEX `IX_registrations_Email` ON `registrations` (`Email`)',
                    'SELECT 1'
                );

                PREPARE migration_stmt FROM @ddl;
                EXECUTE migration_stmt;
                DEALLOCATE PREPARE migration_stmt;
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Existing tables and indexes may predate this migration.
            // Do not drop them automatically because doing so could
            // remove database objects or data that existed beforehand.
        }
    }
}
