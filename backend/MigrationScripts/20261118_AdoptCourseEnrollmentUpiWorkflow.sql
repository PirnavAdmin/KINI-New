-- Apply 20261118090000_AdoptCourseEnrollmentUpiWorkflow (idempotent; safe on the database that already has the CourseEnrollments tables and on one that does not).
-- Review before running. Uses DELIMITER, so run it with the mysql client or MySQL Workbench.

CREATE TABLE IF NOT EXISTS `CourseEnrollments` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `EnrollmentNumber` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `StudentId` int NULL,
    `CourseId` int NOT NULL,
    `OrganizationId` int NOT NULL,
    `CourseFee` decimal(18,2) NOT NULL,
    `FullName` varchar(200) CHARACTER SET utf8mb4 NOT NULL,
    `Email` varchar(254) CHARACTER SET utf8mb4 NOT NULL,
    `MobileNumber` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `Qualification` varchar(150) CHARACTER SET utf8mb4 NULL,
    `CollegeName` varchar(200) CHARACTER SET utf8mb4 NULL,
    `Address` varchar(500) CHARACTER SET utf8mb4 NULL,
    `EnrollmentStatus` varchar(30) CHARACTER SET utf8mb4 NOT NULL,
    `CurrentBatchId` int NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    `PaymentReference` varchar(100) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
    `EnrollmentAccessKeyExpiresAt` datetime(6) NULL,
    `EnrollmentAccessKeyHash` varchar(64) CHARACTER SET utf8mb4 NULL,
    PRIMARY KEY (`Id`),
    UNIQUE KEY `IX_CourseEnrollments_EnrollmentNumber` (`EnrollmentNumber`),
    UNIQUE KEY `IX_CourseEnrollments_PaymentReference` (`PaymentReference`),
    KEY `IX_CourseEnrollments_CourseId` (`CourseId`),
    KEY `IX_CourseEnrollments_CurrentBatchId` (`CurrentBatchId`),
    KEY `IX_CourseEnrollments_OrganizationId_EnrollmentStatus` (`OrganizationId`, `EnrollmentStatus`),
    KEY `IX_CourseEnrollments_StudentId_EnrollmentStatus` (`StudentId`, `EnrollmentStatus`),
    CONSTRAINT `FK_CourseEnrollments_Batches_CurrentBatchId` FOREIGN KEY (`CurrentBatchId`) REFERENCES `Batches` (`BatchId`) ON DELETE RESTRICT,
    CONSTRAINT `FK_CourseEnrollments_Courses_CourseId` FOREIGN KEY (`CourseId`) REFERENCES `Courses` (`CourseId`) ON DELETE RESTRICT,
    CONSTRAINT `FK_CourseEnrollments_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `Organizations` (`OrganizationId`) ON DELETE RESTRICT,
    CONSTRAINT `FK_CourseEnrollments_Students_StudentId` FOREIGN KEY (`StudentId`) REFERENCES `Students` (`StudentId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `CoursePayments` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `EnrollmentId` int NOT NULL,
    `UTRNumber` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `Amount` decimal(18,2) NOT NULL,
    `PaymentDate` datetime(6) NOT NULL,
    `ScreenshotPath` varchar(500) CHARACTER SET utf8mb4 NOT NULL,
    `PaymentStatus` varchar(30) CHARACTER SET utf8mb4 NOT NULL,
    `RejectionReason` varchar(500) CHARACTER SET utf8mb4 NULL,
    `VerifiedBy` int NULL,
    `VerifiedAt` datetime(6) NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `PaymentMethod` varchar(30) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
    PRIMARY KEY (`Id`),
    UNIQUE KEY `IX_CoursePayments_UTRNumber` (`UTRNumber`),
    KEY `IX_CoursePayments_EnrollmentId_PaymentStatus` (`EnrollmentId`, `PaymentStatus`),
    KEY `IX_CoursePayments_VerifiedBy` (`VerifiedBy`),
    CONSTRAINT `FK_CoursePayments_CourseEnrollments_EnrollmentId` FOREIGN KEY (`EnrollmentId`) REFERENCES `CourseEnrollments` (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_CoursePayments_Users_VerifiedBy` FOREIGN KEY (`VerifiedBy`) REFERENCES `Users` (`UserId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `EnrollmentApprovalHistory` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `EnrollmentId` int NOT NULL,
    `Action` varchar(30) CHARACTER SET utf8mb4 NOT NULL,
    `ActionBy` int NULL,
    `Remarks` varchar(500) CHARACTER SET utf8mb4 NULL,
    `CreatedAt` datetime(6) NOT NULL,
    PRIMARY KEY (`Id`),
    KEY `IX_EnrollmentApprovalHistory_ActionBy` (`ActionBy`),
    KEY `IX_EnrollmentApprovalHistory_EnrollmentId_CreatedAt` (`EnrollmentId`, `CreatedAt`),
    CONSTRAINT `FK_EnrollmentApprovalHistory_CourseEnrollments_EnrollmentId` FOREIGN KEY (`EnrollmentId`) REFERENCES `CourseEnrollments` (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_EnrollmentApprovalHistory_Users_ActionBy` FOREIGN KEY (`ActionBy`) REFERENCES `Users` (`UserId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `BatchAssignmentHistory` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `CourseEnrollmentId` int NOT NULL,
    `PreviousBatchId` int NULL,
    `NewBatchId` int NOT NULL,
    `ActionBy` int NULL,
    `Remarks` varchar(500) CHARACTER SET utf8mb4 NULL,
    `CreatedAt` datetime(6) NOT NULL,
    PRIMARY KEY (`Id`),
    KEY `IX_BatchAssignmentHistory_ActionBy` (`ActionBy`),
    KEY `IX_BatchAssignmentHistory_CourseEnrollmentId_CreatedAt` (`CourseEnrollmentId`, `CreatedAt`),
    KEY `IX_BatchAssignmentHistory_NewBatchId` (`NewBatchId`),
    KEY `IX_BatchAssignmentHistory_PreviousBatchId` (`PreviousBatchId`),
    CONSTRAINT `FK_BatchAssignmentHistory_Batches_NewBatchId` FOREIGN KEY (`NewBatchId`) REFERENCES `Batches` (`BatchId`) ON DELETE RESTRICT,
    CONSTRAINT `FK_BatchAssignmentHistory_Batches_PreviousBatchId` FOREIGN KEY (`PreviousBatchId`) REFERENCES `Batches` (`BatchId`) ON DELETE RESTRICT,
    CONSTRAINT `FK_BatchAssignmentHistory_CourseEnrollments_CourseEnrollmentId` FOREIGN KEY (`CourseEnrollmentId`) REFERENCES `CourseEnrollments` (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_BatchAssignmentHistory_Users_ActionBy` FOREIGN KEY (`ActionBy`) REFERENCES `Users` (`UserId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `OrganizationPaymentSettings` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `OrganizationId` int NOT NULL,
    `UpiId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `PayeeName` varchar(200) CHARACTER SET utf8mb4 NOT NULL,
    `QrCodePath` varchar(500) CHARACTER SET utf8mb4 NULL,
    `IsActive` tinyint(1) NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    PRIMARY KEY (`Id`),
    UNIQUE KEY `IX_OrganizationPaymentSettings_OrganizationId` (`OrganizationId`),
    CONSTRAINT `FK_OrganizationPaymentSettings_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `Organizations` (`OrganizationId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP PROCEDURE IF EXISTS kini_adopt_upi_up_1;

DELIMITER //
CREATE PROCEDURE kini_adopt_upi_up_1()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND COLUMN_NAME = 'PaymentStatus') THEN
        ALTER TABLE `CourseEnrollments` ADD `PaymentStatus` varchar(30) CHARACTER SET utf8mb4 NOT NULL DEFAULT 'NotSubmitted';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND COLUMN_NAME = 'AccountStatus') THEN
        ALTER TABLE `CourseEnrollments` ADD `AccountStatus` varchar(30) CHARACTER SET utf8mb4 NOT NULL DEFAULT 'NotCreated';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND COLUMN_NAME = 'UserId') THEN
        ALTER TABLE `CourseEnrollments` ADD `UserId` int NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND COLUMN_NAME = 'ReviewedBy') THEN
        ALTER TABLE `CourseEnrollments` ADD `ReviewedBy` varchar(100) CHARACTER SET utf8mb4 NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND COLUMN_NAME = 'ReviewedAt') THEN
        ALTER TABLE `CourseEnrollments` ADD `ReviewedAt` datetime(6) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND COLUMN_NAME = 'RejectionReason') THEN
        ALTER TABLE `CourseEnrollments` ADD `RejectionReason` varchar(500) CHARACTER SET utf8mb4 NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND COLUMN_NAME = 'ConcurrencyStamp') THEN
        ALTER TABLE `CourseEnrollments` ADD `ConcurrencyStamp` varchar(64) CHARACTER SET utf8mb4 NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND COLUMN_NAME = 'IdempotencyKeyHash') THEN
        ALTER TABLE `CourseEnrollments` ADD `IdempotencyKeyHash` varchar(64) CHARACTER SET utf8mb4 NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND COLUMN_NAME = 'TermsAcceptedAt') THEN
        ALTER TABLE `CourseEnrollments` ADD `TermsAcceptedAt` datetime(6) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND INDEX_NAME = 'IX_CourseEnrollments_IdempotencyKeyHash') THEN
        CREATE UNIQUE INDEX `IX_CourseEnrollments_IdempotencyKeyHash` ON `CourseEnrollments` (`IdempotencyKeyHash`);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND INDEX_NAME = 'IX_CourseEnrollments_UserId') THEN
        CREATE INDEX `IX_CourseEnrollments_UserId` ON `CourseEnrollments` (`UserId`);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND INDEX_NAME = 'IX_CourseEnrollments_OrganizationId_CourseId_Email') THEN
        CREATE INDEX `IX_CourseEnrollments_OrganizationId_CourseId_Email` ON `CourseEnrollments` (`OrganizationId`, `CourseId`, `Email`);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CourseEnrollments') AND CONSTRAINT_NAME = 'FK_CourseEnrollments_Users_UserId' AND CONSTRAINT_TYPE = 'FOREIGN KEY') THEN
        ALTER TABLE `CourseEnrollments` ADD CONSTRAINT `FK_CourseEnrollments_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`UserId`) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CoursePayments') AND COLUMN_NAME = 'ScreenshotContentType') THEN
        ALTER TABLE `CoursePayments` ADD `ScreenshotContentType` varchar(100) CHARACTER SET utf8mb4 NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CoursePayments') AND COLUMN_NAME = 'ScreenshotSizeBytes') THEN
        ALTER TABLE `CoursePayments` ADD `ScreenshotSizeBytes` bigint NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CoursePayments') AND COLUMN_NAME = 'ScreenshotSha256') THEN
        ALTER TABLE `CoursePayments` ADD `ScreenshotSha256` varchar(64) CHARACTER SET utf8mb4 NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CoursePayments') AND COLUMN_NAME = 'Remarks') THEN
        ALTER TABLE `CoursePayments` ADD `Remarks` varchar(500) CHARACTER SET utf8mb4 NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CoursePayments') AND COLUMN_NAME = 'ReviewedBy') THEN
        ALTER TABLE `CoursePayments` ADD `ReviewedBy` varchar(100) CHARACTER SET utf8mb4 NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CoursePayments') AND INDEX_NAME = 'IX_CoursePayments_ScreenshotSha256') THEN
        CREATE INDEX `IX_CoursePayments_ScreenshotSha256` ON `CoursePayments` (`ScreenshotSha256`);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CoursePayments') AND COLUMN_NAME = 'IdempotencyKeyHash') THEN
        ALTER TABLE `CoursePayments` ADD `IdempotencyKeyHash` varchar(64) CHARACTER SET utf8mb4 NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('CoursePayments') AND INDEX_NAME = 'IX_CoursePayments_IdempotencyKeyHash') THEN
        CREATE UNIQUE INDEX `IX_CoursePayments_IdempotencyKeyHash` ON `CoursePayments` (`IdempotencyKeyHash`);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('EnrollmentApprovalHistory') AND COLUMN_NAME = 'Actor') THEN
        ALTER TABLE `EnrollmentApprovalHistory` ADD `Actor` varchar(100) CHARACTER SET utf8mb4 NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('EnrollmentApprovalHistory') AND COLUMN_NAME = 'FromStatus') THEN
        ALTER TABLE `EnrollmentApprovalHistory` ADD `FromStatus` varchar(100) CHARACTER SET utf8mb4 NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('EnrollmentApprovalHistory') AND COLUMN_NAME = 'ToStatus') THEN
        ALTER TABLE `EnrollmentApprovalHistory` ADD `ToStatus` varchar(100) CHARACTER SET utf8mb4 NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('BatchAssignmentHistory') AND COLUMN_NAME = 'Actor') THEN
        ALTER TABLE `BatchAssignmentHistory` ADD `Actor` varchar(100) CHARACTER SET utf8mb4 NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('EnrollmentApprovalHistory') AND COLUMN_NAME = 'ActionBy' AND IS_NULLABLE = 'NO') THEN
        ALTER TABLE `EnrollmentApprovalHistory` MODIFY `ActionBy` int NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('BatchAssignmentHistory') AND COLUMN_NAME = 'ActionBy' AND IS_NULLABLE = 'NO') THEN
        ALTER TABLE `BatchAssignmentHistory` MODIFY `ActionBy` int NULL;
    END IF;
END //
DELIMITER ;

CALL kini_adopt_upi_up_1();

DROP PROCEDURE IF EXISTS kini_adopt_upi_up_1;

CREATE TABLE IF NOT EXISTS `PasswordSetupTokens` (
    `PasswordSetupTokenId` int NOT NULL AUTO_INCREMENT,
    `UserId` int NOT NULL,
    `CourseEnrollmentId` int NULL,
    `TokenHash` varchar(64) CHARACTER SET utf8mb4 NOT NULL,
    `Purpose` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    `ExpiresAt` datetime(6) NOT NULL,
    `UsedAt` datetime(6) NULL,
    `RevokedAt` datetime(6) NULL,
    `CreatedAt` datetime(6) NOT NULL,
    PRIMARY KEY (`PasswordSetupTokenId`),
    UNIQUE KEY `IX_PasswordSetupTokens_TokenHash` (`TokenHash`),
    KEY `IX_PasswordSetupTokens_CourseEnrollmentId` (`CourseEnrollmentId`),
    KEY `IX_PasswordSetupTokens_UserId_UsedAt` (`UserId`, `UsedAt`),
    CONSTRAINT `FK_PasswordSetupTokens_CourseEnrollments_CourseEnrollmentId` FOREIGN KEY (`CourseEnrollmentId`) REFERENCES `CourseEnrollments` (`Id`) ON DELETE SET NULL,
    CONSTRAINT `FK_PasswordSetupTokens_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`UserId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `Permissions` (`Module`, `IsActive`) SELECT 'Payment Verification', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `Permissions` WHERE `Module` = 'Payment Verification');

INSERT INTO `Permissions` (`Module`, `IsActive`) SELECT 'Enrollment Approval', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `Permissions` WHERE `Module` = 'Enrollment Approval');

INSERT INTO `RolePermissions` (`Role`, `OrganizationId`, `PermissionId`, `CanView`, `CanAdd`, `CanEdit`, `CanDelete`, `CanAccess`) SELECT r.`Role`, NULL, p.`PermissionId`, 1, 0, 1, 0, 1 FROM `Permissions` p CROSS JOIN (SELECT 'Organization' AS `Role` UNION ALL SELECT 'SuperAdmin') r WHERE p.`Module` IN ('Payment Verification', 'Enrollment Approval') AND NOT EXISTS (SELECT 1 FROM `RolePermissions` rp WHERE rp.`Role` = r.`Role` AND rp.`OrganizationId` IS NULL AND rp.`PermissionId` = p.`PermissionId`);

INSERT IGNORE INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`) VALUES ('20261118090000_AdoptCourseEnrollmentUpiWorkflow', '8.0.18');
