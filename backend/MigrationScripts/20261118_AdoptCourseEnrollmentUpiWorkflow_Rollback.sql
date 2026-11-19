-- Roll back 20261118090000_AdoptCourseEnrollmentUpiWorkflow: drops PasswordSetupTokens and the columns/indexes/permissions it added. Data in those columns is lost. The five workflow tables are kept.
-- Review before running. Uses DELIMITER, so run it with the mysql client or MySQL Workbench.

DROP TABLE IF EXISTS `PasswordSetupTokens`;

DROP PROCEDURE IF EXISTS kini_adopt_upi_down_1;

DELIMITER //
CREATE PROCEDURE kini_adopt_upi_down_1()
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND CONSTRAINT_NAME = 'FK_CourseEnrollments_Users_UserId' AND CONSTRAINT_TYPE = 'FOREIGN KEY') THEN
        ALTER TABLE `CourseEnrollments` DROP FOREIGN KEY `FK_CourseEnrollments_Users_UserId`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND INDEX_NAME = 'IX_CourseEnrollments_UserId') THEN
        DROP INDEX `IX_CourseEnrollments_UserId` ON `CourseEnrollments`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND INDEX_NAME = 'IX_CourseEnrollments_OrganizationId_CourseId_Email') THEN
        DROP INDEX `IX_CourseEnrollments_OrganizationId_CourseId_Email` ON `CourseEnrollments`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CoursePayments') AND INDEX_NAME = 'IX_CoursePayments_ScreenshotSha256') THEN
        DROP INDEX `IX_CoursePayments_ScreenshotSha256` ON `CoursePayments`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CoursePayments') AND INDEX_NAME = 'IX_CoursePayments_IdempotencyKeyHash') THEN
        DROP INDEX `IX_CoursePayments_IdempotencyKeyHash` ON `CoursePayments`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND INDEX_NAME = 'IX_CourseEnrollments_IdempotencyKeyHash') THEN
        DROP INDEX `IX_CourseEnrollments_IdempotencyKeyHash` ON `CourseEnrollments`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND COLUMN_NAME = 'PaymentStatus') THEN
        ALTER TABLE `CourseEnrollments` DROP COLUMN `PaymentStatus`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND COLUMN_NAME = 'AccountStatus') THEN
        ALTER TABLE `CourseEnrollments` DROP COLUMN `AccountStatus`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND COLUMN_NAME = 'UserId') THEN
        ALTER TABLE `CourseEnrollments` DROP COLUMN `UserId`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND COLUMN_NAME = 'ReviewedBy') THEN
        ALTER TABLE `CourseEnrollments` DROP COLUMN `ReviewedBy`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND COLUMN_NAME = 'ReviewedAt') THEN
        ALTER TABLE `CourseEnrollments` DROP COLUMN `ReviewedAt`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND COLUMN_NAME = 'RejectionReason') THEN
        ALTER TABLE `CourseEnrollments` DROP COLUMN `RejectionReason`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND COLUMN_NAME = 'ConcurrencyStamp') THEN
        ALTER TABLE `CourseEnrollments` DROP COLUMN `ConcurrencyStamp`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND COLUMN_NAME = 'IdempotencyKeyHash') THEN
        ALTER TABLE `CourseEnrollments` DROP COLUMN `IdempotencyKeyHash`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND COLUMN_NAME = 'TermsAcceptedAt') THEN
        ALTER TABLE `CourseEnrollments` DROP COLUMN `TermsAcceptedAt`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CoursePayments') AND COLUMN_NAME = 'ScreenshotContentType') THEN
        ALTER TABLE `CoursePayments` DROP COLUMN `ScreenshotContentType`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CoursePayments') AND COLUMN_NAME = 'ScreenshotSizeBytes') THEN
        ALTER TABLE `CoursePayments` DROP COLUMN `ScreenshotSizeBytes`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CoursePayments') AND COLUMN_NAME = 'ScreenshotSha256') THEN
        ALTER TABLE `CoursePayments` DROP COLUMN `ScreenshotSha256`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CoursePayments') AND COLUMN_NAME = 'Remarks') THEN
        ALTER TABLE `CoursePayments` DROP COLUMN `Remarks`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CoursePayments') AND COLUMN_NAME = 'ReviewedBy') THEN
        ALTER TABLE `CoursePayments` DROP COLUMN `ReviewedBy`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CoursePayments') AND COLUMN_NAME = 'IdempotencyKeyHash') THEN
        ALTER TABLE `CoursePayments` DROP COLUMN `IdempotencyKeyHash`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('EnrollmentApprovalHistory') AND COLUMN_NAME = 'Actor') THEN
        ALTER TABLE `EnrollmentApprovalHistory` DROP COLUMN `Actor`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('EnrollmentApprovalHistory') AND COLUMN_NAME = 'FromStatus') THEN
        ALTER TABLE `EnrollmentApprovalHistory` DROP COLUMN `FromStatus`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('EnrollmentApprovalHistory') AND COLUMN_NAME = 'ToStatus') THEN
        ALTER TABLE `EnrollmentApprovalHistory` DROP COLUMN `ToStatus`;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('BatchAssignmentHistory') AND COLUMN_NAME = 'Actor') THEN
        ALTER TABLE `BatchAssignmentHistory` DROP COLUMN `Actor`;
    END IF;
END //
DELIMITER ;

CALL kini_adopt_upi_down_1();

DROP PROCEDURE IF EXISTS kini_adopt_upi_down_1;

DELETE FROM `Permissions` WHERE `Module` IN ('Payment Verification', 'Enrollment Approval');

DELETE FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261118090000_AdoptCourseEnrollmentUpiWorkflow';
