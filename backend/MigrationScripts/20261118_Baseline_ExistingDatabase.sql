-- ONE-TIME baseline for a database created by the other backend version
-- (e.g. talentspheredb9: its __EFMigrationsHistory starts at 20261102043945_InitialCreate).
--
-- Its schema already equals this repo's first two migrations (checked table by
-- table against the model), but their ids are missing from the history, so
-- `dotnet ef database update` would try to create every table again and fail.
-- This records them as applied. It changes no table and no data.
--
-- Run it ONLY on such a database, after a backup, then run the migration
-- (dotnet ef database update, or 20261118_AdoptCourseEnrollmentUpiWorkflow.sql).
-- Do NOT run it on the remote database, whose history already has these ids.

INSERT IGNORE INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`) VALUES
    ('20261022092454_InitialCreate', '8.0.18'),
    ('20261027123432_AddPublicCourseVisibility', '8.0.18');

SELECT `MigrationId` FROM `__EFMigrationsHistory` ORDER BY `MigrationId`;
