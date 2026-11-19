START TRANSACTION;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261118100000_AddLeaveRequestAttachments') THEN

    CREATE TABLE `LeaveRequestAttachments` (
        `LeaveRequestAttachmentId` int NOT NULL AUTO_INCREMENT,
        `LeaveRequestId` int NOT NULL,
        `OrganizationId` int NOT NULL,
        `UploadedByUserId` int NOT NULL,
        `OriginalFileName` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
        `ContentType` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
        `SizeBytes` bigint NOT NULL,
        `Sha256` varchar(64) CHARACTER SET utf8mb4 NOT NULL,
        `StoragePath` varchar(500) CHARACTER SET utf8mb4 NOT NULL,
        `UploadedAt` datetime(6) NOT NULL,
        CONSTRAINT `PK_LeaveRequestAttachments` PRIMARY KEY (`LeaveRequestAttachmentId`),
        CONSTRAINT `FK_LeaveRequestAttachments_LeaveRequests_LeaveRequestId` FOREIGN KEY (`LeaveRequestId`) REFERENCES `LeaveRequests` (`LeaveRequestId`) ON DELETE RESTRICT
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261118100000_AddLeaveRequestAttachments') THEN

    CREATE INDEX `IX_LeaveRequestAttachments_LeaveRequestId` ON `LeaveRequestAttachments` (`LeaveRequestId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261118100000_AddLeaveRequestAttachments') THEN

    CREATE INDEX `IX_LeaveRequestAttachments_OrganizationId_LeaveRequestId` ON `LeaveRequestAttachments` (`OrganizationId`, `LeaveRequestId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261118100000_AddLeaveRequestAttachments') THEN

    INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
    VALUES ('20261118100000_AddLeaveRequestAttachments', '8.0.18');

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

COMMIT;

