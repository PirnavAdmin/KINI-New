-- MySQL dump 10.13  Distrib 8.4.9, for Win64 (x86_64)
--
-- Host: localhost    Database: talentspheredb9
-- ------------------------------------------------------
-- Server version	8.4.9

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `talentspheredb9`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `talentspheredb9` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `talentspheredb9`;

--
-- Table structure for table `__efmigrationshistory`
--

DROP TABLE IF EXISTS `__efmigrationshistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__efmigrationshistory` (
  `MigrationId` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ProductVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `__efmigrationshistory`
--

LOCK TABLES `__efmigrationshistory` WRITE;
/*!40000 ALTER TABLE `__efmigrationshistory` DISABLE KEYS */;
INSERT INTO `__efmigrationshistory` VALUES ('20261022092454_InitialCreate','8.0.18'),('20261027123432_AddPublicCourseVisibility','8.0.18'),('20261102043945_InitialCreate','8.0.18'),('20261105050629_AddCourseEnrollmentUpiPaymentWorkflow','8.0.18'),('20261105070308_AddOrganizationPaymentSettingsPermission','8.0.18'),('20261106115801_FinalUpiPaymentModuleUpdates','8.0.18'),('20261111122426_AddGuestEnrollmentSupport','8.0.18'),('20261118090000_AdoptCourseEnrollmentUpiWorkflow','8.0.18'),('20261118100000_AddLeaveRequestAttachments','8.0.18'),('20261118110000_AddCoursePosterUrl','8.0.18'),('20261118120000_AddOrganizationLogoUrl','8.0.18');
/*!40000 ALTER TABLE `__efmigrationshistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assessmentoptions`
--

DROP TABLE IF EXISTS `assessmentoptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessmentoptions` (
  `OptionId` int NOT NULL AUTO_INCREMENT,
  `QuestionId` int NOT NULL,
  `OptionText` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IsCorrect` tinyint(1) NOT NULL,
  PRIMARY KEY (`OptionId`),
  KEY `IX_AssessmentOptions_QuestionId` (`QuestionId`),
  CONSTRAINT `FK_AssessmentOptions_AssessmentQuestions_QuestionId` FOREIGN KEY (`QuestionId`) REFERENCES `assessmentquestions` (`QuestionId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessmentoptions`
--

LOCK TABLES `assessmentoptions` WRITE;
/*!40000 ALTER TABLE `assessmentoptions` DISABLE KEYS */;
INSERT INTO `assessmentoptions` VALUES (1,3,'useEffect',0),(2,1,'XML',0),(3,4,'Building user interfaces',1),(4,5,'State',0),(5,2,'To define CSS styles',0),(6,1,'JSX',1),(7,2,'To handle side effects in a component',1),(8,4,'Managing relational databases',0),(9,3,'useContext',0),(10,2,'To create class constructors',0),(11,1,'SQL',0),(12,4,'Creating operating systems',0),(13,3,'useState',1),(14,5,'Props',1),(15,1,'YAML',0),(16,2,'To replace all props',0),(17,3,'useMemo',0),(18,4,'Compiling Java programs',0),(19,5,'Effect',0),(20,5,'Ref',0),(21,6,'Building user interfaces',1),(22,6,'Managing relational databases',0),(23,6,'Creating operating systems',0),(24,6,'Compiling Java programs',0),(25,7,'To define CSS styles',0),(26,7,'To handle side effects in a component',1),(27,7,'To create class constructors',0),(28,7,'To replace all props',0),(29,8,'State',0),(30,8,'Props',1),(31,8,'Effect',0),(32,8,'Ref',0),(33,9,'XML',0),(34,9,'JSX',1),(35,9,'SQL',0),(36,9,'YAML',0),(37,10,'useEffect',0),(38,10,'useContext',0),(39,10,'useState',1),(40,10,'useMemo',0);
/*!40000 ALTER TABLE `assessmentoptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assessmentquestions`
--

DROP TABLE IF EXISTS `assessmentquestions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessmentquestions` (
  `QuestionId` int NOT NULL AUTO_INCREMENT,
  `AssessmentId` int NOT NULL,
  `QuestionText` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `QuestionType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Marks` int NOT NULL,
  `Difficulty` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CorrectAnswer` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `OrderNo` int NOT NULL,
  PRIMARY KEY (`QuestionId`),
  KEY `IX_AssessmentQuestions_AssessmentId` (`AssessmentId`),
  CONSTRAINT `FK_AssessmentQuestions_Assessments_AssessmentId` FOREIGN KEY (`AssessmentId`) REFERENCES `assessments` (`AssessmentId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessmentquestions`
--

LOCK TABLES `assessmentquestions` WRITE;
/*!40000 ALTER TABLE `assessmentquestions` DISABLE KEYS */;
INSERT INTO `assessmentquestions` VALUES (1,1,'Which syntax extension is commonly used to describe UI in React?','MCQ',5,'Easy','JSX',2),(2,1,'What is the purpose of the useEffect Hook?','MCQ',5,'Medium','To handle side effects in a component',5),(3,1,'Which React Hook is commonly used to manage state in a function component?','MCQ',5,'Medium','useState',4),(4,1,'What is React primarily used for?','MCQ',5,'Easy','Building user interfaces',1),(5,1,'Which React feature lets a component receive data from its parent?','MCQ',5,'Easy','Props',3),(6,2,'What is React primarily used for?','MCQ',5,'Easy','Building user interfaces',1),(7,2,'What is the purpose of the useEffect Hook?','MCQ',5,'Medium','To handle side effects in a component',5),(8,2,'Which React feature lets a component receive data from its parent?','MCQ',5,'Easy','Props',3),(9,2,'Which syntax extension is commonly used to describe UI in React?','MCQ',5,'Easy','JSX',2),(10,2,'Which React Hook is commonly used to manage state in a function component?','MCQ',5,'Medium','useState',4);
/*!40000 ALTER TABLE `assessmentquestions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assessments`
--

DROP TABLE IF EXISTS `assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessments` (
  `AssessmentId` int NOT NULL AUTO_INCREMENT,
  `Title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CourseId` int NOT NULL,
  `BatchId` int NOT NULL,
  `TotalMarks` int NOT NULL,
  `PassingMarks` int NOT NULL,
  `DurationMinutes` int NOT NULL,
  `AssessmentType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `StartDate` datetime(6) NOT NULL,
  `EndDate` datetime(6) NOT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`AssessmentId`),
  KEY `IX_Assessments_BatchId` (`BatchId`),
  KEY `IX_Assessments_CourseId` (`CourseId`),
  CONSTRAINT `FK_Assessments_Batches_BatchId` FOREIGN KEY (`BatchId`) REFERENCES `batches` (`BatchId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_Assessments_Courses_CourseId` FOREIGN KEY (`CourseId`) REFERENCES `courses` (`CourseId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessments`
--

LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
INSERT INTO `assessments` VALUES (1,'Test','',1,3,25,5,36,'MCQ','2026-11-11 07:00:00.000000','2026-11-11 07:36:00.000000','Published','2026-11-11 06:38:07.007219','2026-11-11 06:38:17.563942'),(2,'Test 2','',1,3,25,5,1440,'MCQ','2026-11-11 07:00:00.000000','2026-11-12 07:00:00.000000','Published','2026-11-11 06:50:45.653031','2026-11-11 06:50:55.780012');
/*!40000 ALTER TABLE `assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendances`
--

DROP TABLE IF EXISTS `attendances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendances` (
  `AttendanceId` int NOT NULL AUTO_INCREMENT,
  `StudentId` int NOT NULL,
  `AttendancePercentage` decimal(5,2) NOT NULL,
  `LiveClassId` int NOT NULL,
  `FirstJoinTime` datetime(6) DEFAULT NULL,
  `LastLeaveTime` datetime(6) DEFAULT NULL,
  `TotalDurationMinutes` int NOT NULL,
  `Status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IsLate` tinyint(1) NOT NULL,
  `LeftEarly` tinyint(1) NOT NULL,
  `IsAutoMarked` tinyint(1) NOT NULL,
  `IsSynced` tinyint(1) NOT NULL,
  `LastSyncedAt` datetime(6) DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL,
  `DeletedOn` datetime(6) DEFAULT NULL,
  `DeletedBy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`AttendanceId`),
  UNIQUE KEY `IX_Attendances_StudentId_LiveClassId` (`StudentId`,`LiveClassId`),
  KEY `IX_Attendances_LiveClassId` (`LiveClassId`),
  CONSTRAINT `FK_Attendances_LiveClasses_LiveClassId` FOREIGN KEY (`LiveClassId`) REFERENCES `liveclasses` (`LiveClassId`) ON DELETE CASCADE,
  CONSTRAINT `FK_Attendances_Students_StudentId` FOREIGN KEY (`StudentId`) REFERENCES `students` (`StudentId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendances`
--

LOCK TABLES `attendances` WRITE;
/*!40000 ALTER TABLE `attendances` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendancesessions`
--

DROP TABLE IF EXISTS `attendancesessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendancesessions` (
  `AttendanceSessionId` int NOT NULL AUTO_INCREMENT,
  `AttendanceId` int NOT NULL,
  `JoinedAt` datetime(6) NOT NULL,
  `LeftAt` datetime(6) DEFAULT NULL,
  `DurationMinutes` int NOT NULL,
  `MeetingParticipantId` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ParticipantEmail` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ParticipantName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IsCompleted` tinyint(1) NOT NULL,
  PRIMARY KEY (`AttendanceSessionId`),
  KEY `IX_AttendanceSessions_AttendanceId` (`AttendanceId`),
  CONSTRAINT `FK_AttendanceSessions_Attendances_AttendanceId` FOREIGN KEY (`AttendanceId`) REFERENCES `attendances` (`AttendanceId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendancesessions`
--

LOCK TABLES `attendancesessions` WRITE;
/*!40000 ALTER TABLE `attendancesessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendancesessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `batchassignmenthistory`
--

DROP TABLE IF EXISTS `batchassignmenthistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batchassignmenthistory` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `CourseEnrollmentId` int NOT NULL,
  `PreviousBatchId` int DEFAULT NULL,
  `NewBatchId` int NOT NULL,
  `ActionBy` int DEFAULT NULL,
  `Remarks` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `Actor` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_BatchAssignmentHistory_ActionBy` (`ActionBy`),
  KEY `IX_BatchAssignmentHistory_CourseEnrollmentId_CreatedAt` (`CourseEnrollmentId`,`CreatedAt`),
  KEY `IX_BatchAssignmentHistory_NewBatchId` (`NewBatchId`),
  KEY `IX_BatchAssignmentHistory_PreviousBatchId` (`PreviousBatchId`),
  CONSTRAINT `FK_BatchAssignmentHistory_Batches_NewBatchId` FOREIGN KEY (`NewBatchId`) REFERENCES `batches` (`BatchId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_BatchAssignmentHistory_Batches_PreviousBatchId` FOREIGN KEY (`PreviousBatchId`) REFERENCES `batches` (`BatchId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_BatchAssignmentHistory_CourseEnrollments_CourseEnrollmentId` FOREIGN KEY (`CourseEnrollmentId`) REFERENCES `courseenrollments` (`Id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_BatchAssignmentHistory_Users_ActionBy` FOREIGN KEY (`ActionBy`) REFERENCES `users` (`UserId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batchassignmenthistory`
--

LOCK TABLES `batchassignmenthistory` WRITE;
/*!40000 ALTER TABLE `batchassignmenthistory` DISABLE KEYS */;
INSERT INTO `batchassignmenthistory` VALUES (1,3,NULL,6,NULL,'Batch assigned at approval','2026-11-18 05:00:10.337792','OrganizationAdmin:1'),(2,6,NULL,6,NULL,'Batch assigned at approval','2026-11-18 05:49:54.694452','OrganizationAdmin:1');
/*!40000 ALTER TABLE `batchassignmenthistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `batches`
--

DROP TABLE IF EXISTS `batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batches` (
  `BatchId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `BatchName` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `MentorId` int NOT NULL,
  `CourseId` int NOT NULL,
  `BatchType` int NOT NULL,
  `StartDate` datetime(6) NOT NULL,
  `EndDate` datetime(6) NOT NULL,
  `Capacity` int NOT NULL,
  `EnrolledStudents` int NOT NULL,
  `LiveClasses` int NOT NULL,
  `RecordedClasses` int NOT NULL,
  `Description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Status` int NOT NULL,
  `CreatedDate` datetime(6) NOT NULL,
  `ModifiedDate` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`BatchId`),
  KEY `IX_Batches_CourseId` (`CourseId`),
  KEY `IX_Batches_MentorId` (`MentorId`),
  KEY `IX_Batches_OrganizationId_BatchName` (`OrganizationId`,`BatchName`),
  CONSTRAINT `FK_Batches_Courses_CourseId` FOREIGN KEY (`CourseId`) REFERENCES `courses` (`CourseId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_Batches_Mentors_MentorId` FOREIGN KEY (`MentorId`) REFERENCES `mentors` (`MentorId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_Batches_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batches`
--

LOCK TABLES `batches` WRITE;
/*!40000 ALTER TABLE `batches` DISABLE KEYS */;
INSERT INTO `batches` VALUES (1,1,'Java Full Stack 1',6,3,0,'2026-11-02 13:00:00.000000','2026-12-02 13:00:00.000000',25,7,0,0,'',1,'2026-11-02 06:50:38.562135','2026-11-13 04:56:43.437203'),(2,1,'Cybersecurity 1',6,5,0,'2026-11-01 13:00:00.000000','2027-01-01 13:00:00.000000',25,5,0,0,'',1,'2026-11-02 06:51:11.134070','2026-11-09 06:19:15.716718'),(3,1,'React.js 1',1,1,0,'2026-11-01 18:30:00.000000','2027-01-01 18:30:00.000000',25,5,0,0,'',1,'2026-11-02 06:51:44.636948','2026-11-11 06:04:48.104114'),(4,1,'RPA 11',4,4,0,'2026-11-02 00:00:00.000000','2026-12-17 00:00:00.000000',25,0,0,0,'',0,'2026-11-02 06:52:13.809680','2026-11-02 10:13:45.003876'),(5,1,'ML 1',5,9,0,'2026-11-06 00:00:00.000000','2027-02-06 00:00:00.000000',25,1,0,0,'',1,'2026-11-06 10:23:45.730643',NULL),(6,1,'Python 1',1,2,0,'2026-11-18 00:00:00.000000','2026-12-19 00:00:00.000000',25,1,0,0,'',0,'2026-11-18 04:59:41.250166',NULL);
/*!40000 ALTER TABLE `batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `batchmodulecompletions`
--

DROP TABLE IF EXISTS `batchmodulecompletions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batchmodulecompletions` (
  `BatchModuleCompletionId` int NOT NULL AUTO_INCREMENT,
  `BatchId` int NOT NULL,
  `CourseId` int NOT NULL,
  `ModuleId` int NOT NULL,
  `IsCompleted` tinyint(1) DEFAULT NULL,
  `CompletedAtUtc` datetime(6) DEFAULT NULL,
  `CompletedByMentorId` int DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `UpdatedAtUtc` datetime(6) NOT NULL,
  PRIMARY KEY (`BatchModuleCompletionId`),
  UNIQUE KEY `IX_BatchModuleCompletions_BatchId_ModuleId` (`BatchId`,`ModuleId`),
  KEY `IX_BatchModuleCompletions_CourseId` (`CourseId`),
  KEY `IX_BatchModuleCompletions_ModuleId` (`ModuleId`),
  CONSTRAINT `FK_BatchModuleCompletions_Batches_BatchId` FOREIGN KEY (`BatchId`) REFERENCES `batches` (`BatchId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_BatchModuleCompletions_CourseModules_ModuleId` FOREIGN KEY (`ModuleId`) REFERENCES `coursemodules` (`ModuleId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_BatchModuleCompletions_Courses_CourseId` FOREIGN KEY (`CourseId`) REFERENCES `courses` (`CourseId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batchmodulecompletions`
--

LOCK TABLES `batchmodulecompletions` WRITE;
/*!40000 ALTER TABLE `batchmodulecompletions` DISABLE KEYS */;
/*!40000 ALTER TABLE `batchmodulecompletions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branches` (
  `BranchId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `BranchName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Location` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `Description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `Status` tinyint(1) NOT NULL,
  `CreatedDate` datetime(6) NOT NULL,
  PRIMARY KEY (`BranchId`),
  KEY `IX_Branches_OrganizationId` (`OrganizationId`),
  CONSTRAINT `FK_Branches_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` VALUES (1,1,'Kini','Madhapur, Hyderabad',NULL,0,'2026-11-18 08:42:35.997836');
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chatattachments`
--

DROP TABLE IF EXISTS `chatattachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chatattachments` (
  `AttachmentId` int NOT NULL AUTO_INCREMENT,
  `ConversationId` int NOT NULL,
  `MessageId` int DEFAULT NULL,
  `OriginalFileName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `StoredFileName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `FileType` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `FileSize` bigint NOT NULL,
  `StoragePath` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UploadedBy` int NOT NULL,
  `UploadedByType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UploadedAt` datetime(6) NOT NULL,
  `IsDeleted` tinyint(1) NOT NULL,
  `ChatConversationConversationId` int DEFAULT NULL,
  PRIMARY KEY (`AttachmentId`),
  KEY `IX_ChatAttachments_ChatConversationConversationId` (`ChatConversationConversationId`),
  KEY `IX_ChatAttachments_ConversationId` (`ConversationId`),
  KEY `IX_ChatAttachments_MessageId` (`MessageId`),
  KEY `IX_ChatAttachments_UploadedBy` (`UploadedBy`),
  CONSTRAINT `FK_ChatAttachments_ChatConversations_ChatConversationConversati~` FOREIGN KEY (`ChatConversationConversationId`) REFERENCES `chatconversations` (`ConversationId`),
  CONSTRAINT `FK_ChatAttachments_ChatConversations_ConversationId` FOREIGN KEY (`ConversationId`) REFERENCES `chatconversations` (`ConversationId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatattachments`
--

LOCK TABLES `chatattachments` WRITE;
/*!40000 ALTER TABLE `chatattachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `chatattachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chatconversations`
--

DROP TABLE IF EXISTS `chatconversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chatconversations` (
  `ConversationId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `MentorId` int NOT NULL,
  `StudentId` int NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `LastMessageAt` datetime(6) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL,
  PRIMARY KEY (`ConversationId`),
  UNIQUE KEY `IX_ChatConversations_OrganizationId_MentorId_StudentId` (`OrganizationId`,`MentorId`,`StudentId`),
  KEY `IX_ChatConversations_MentorId` (`MentorId`),
  KEY `IX_ChatConversations_StudentId` (`StudentId`),
  CONSTRAINT `FK_ChatConversations_Mentors_MentorId` FOREIGN KEY (`MentorId`) REFERENCES `mentors` (`MentorId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_ChatConversations_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_ChatConversations_Students_StudentId` FOREIGN KEY (`StudentId`) REFERENCES `students` (`StudentId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatconversations`
--

LOCK TABLES `chatconversations` WRITE;
/*!40000 ALTER TABLE `chatconversations` DISABLE KEYS */;
INSERT INTO `chatconversations` VALUES (1,1,1,12,'2026-11-12 10:05:11.174260','2026-11-12 10:42:39.112322',1);
/*!40000 ALTER TABLE `chatconversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chatmessages`
--

DROP TABLE IF EXISTS `chatmessages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chatmessages` (
  `MessageId` int NOT NULL AUTO_INCREMENT,
  `ConversationId` int NOT NULL,
  `SenderType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SenderId` int NOT NULL,
  `Message` varchar(5000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SentAt` datetime(6) NOT NULL,
  `IsRead` tinyint(1) NOT NULL,
  `ReadAt` datetime(6) DEFAULT NULL,
  `AttachmentId` int DEFAULT NULL,
  PRIMARY KEY (`MessageId`),
  UNIQUE KEY `IX_ChatMessages_AttachmentId` (`AttachmentId`),
  KEY `IX_ChatMessages_ConversationId` (`ConversationId`),
  KEY `IX_ChatMessages_SentAt` (`SentAt`),
  CONSTRAINT `FK_ChatMessages_ChatAttachments_AttachmentId` FOREIGN KEY (`AttachmentId`) REFERENCES `chatattachments` (`AttachmentId`) ON DELETE SET NULL,
  CONSTRAINT `FK_ChatMessages_ChatConversations_ConversationId` FOREIGN KEY (`ConversationId`) REFERENCES `chatconversations` (`ConversationId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatmessages`
--

LOCK TABLES `chatmessages` WRITE;
/*!40000 ALTER TABLE `chatmessages` DISABLE KEYS */;
INSERT INTO `chatmessages` VALUES (1,1,'Student',12,'Hi','2026-11-12 10:42:39.112322',0,NULL,NULL);
/*!40000 ALTER TABLE `chatmessages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `competencies`
--

DROP TABLE IF EXISTS `competencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `competencies` (
  `CompetencyId` int NOT NULL AUTO_INCREMENT,
  `CompetencyName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `CreatedDate` datetime(6) NOT NULL,
  PRIMARY KEY (`CompetencyId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `competencies`
--

LOCK TABLES `competencies` WRITE;
/*!40000 ALTER TABLE `competencies` DISABLE KEYS */;
/*!40000 ALTER TABLE `competencies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `CouponCode` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DiscountPercentage` decimal(5,2) NOT NULL,
  `DiscountAmount` decimal(18,2) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL,
  `ExpiryDate` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courseenrollments`
--

DROP TABLE IF EXISTS `courseenrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courseenrollments` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `EnrollmentNumber` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `StudentId` int DEFAULT NULL,
  `CourseId` int NOT NULL,
  `OrganizationId` int NOT NULL,
  `CourseFee` decimal(18,2) NOT NULL,
  `FullName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Email` varchar(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `MobileNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Qualification` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CollegeName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EnrollmentStatus` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CurrentBatchId` int DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `PaymentReference` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `EnrollmentAccessKeyExpiresAt` datetime(6) DEFAULT NULL,
  `EnrollmentAccessKeyHash` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PaymentStatus` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'NotSubmitted',
  `AccountStatus` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'NotCreated',
  `UserId` int DEFAULT NULL,
  `ReviewedBy` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ReviewedAt` datetime(6) DEFAULT NULL,
  `RejectionReason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ConcurrencyStamp` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IdempotencyKeyHash` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TermsAcceptedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_CourseEnrollments_EnrollmentNumber` (`EnrollmentNumber`),
  UNIQUE KEY `IX_CourseEnrollments_PaymentReference` (`PaymentReference`),
  UNIQUE KEY `IX_CourseEnrollments_IdempotencyKeyHash` (`IdempotencyKeyHash`),
  KEY `IX_CourseEnrollments_CourseId` (`CourseId`),
  KEY `IX_CourseEnrollments_CurrentBatchId` (`CurrentBatchId`),
  KEY `IX_CourseEnrollments_OrganizationId_EnrollmentStatus` (`OrganizationId`,`EnrollmentStatus`),
  KEY `IX_CourseEnrollments_StudentId_EnrollmentStatus` (`StudentId`,`EnrollmentStatus`),
  KEY `IX_CourseEnrollments_UserId` (`UserId`),
  KEY `IX_CourseEnrollments_OrganizationId_CourseId_Email` (`OrganizationId`,`CourseId`,`Email`),
  CONSTRAINT `FK_CourseEnrollments_Batches_CurrentBatchId` FOREIGN KEY (`CurrentBatchId`) REFERENCES `batches` (`BatchId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_CourseEnrollments_Courses_CourseId` FOREIGN KEY (`CourseId`) REFERENCES `courses` (`CourseId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_CourseEnrollments_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_CourseEnrollments_Students_StudentId` FOREIGN KEY (`StudentId`) REFERENCES `students` (`StudentId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_CourseEnrollments_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`UserId`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courseenrollments`
--

LOCK TABLES `courseenrollments` WRITE;
/*!40000 ALTER TABLE `courseenrollments` DISABLE KEYS */;
INSERT INTO `courseenrollments` VALUES (1,'KEN-261118-2KMWFF',NULL,5,1,36000.00,'Live Check','guest-b5aee276@example.invalid','9876500001','B.Tech',NULL,'Telangana - 500001','PendingPayment',2,'2026-11-18 03:14:18.065555','2026-11-18 03:14:24.065028','KEN-261118-2KMWFF','2026-12-18 03:14:24.065025','0d6a8a1de12141d93b60ab46084e6998daa765ca56b285a7f1a6523a302d2db5','NotSubmitted','NotCreated',NULL,NULL,NULL,NULL,'b537f4bf-4de9-49fe-b034-844042d4eac3','9190d4a762bfdcefd40f6b04e33a9db695a414f56e2ceba9b2b7aed685ec1cc7','2026-11-18 03:14:17.997062'),(2,'KEN-261118-RQ8P7N',NULL,7,1,45000.00,'kadiveti Narendra','kadivetinarendra2000@gmail.com','6300044926','PhD',NULL,'Karnataka - 530068','PendingPayment',NULL,'2026-11-18 03:21:43.272421','2026-11-18 03:21:43.272421','KEN-261118-RQ8P7N','2026-12-18 03:21:43.272416','6690881e5b0627aec857ad805bebcef4286f854b86b9adedc339329c8bd16767','NotSubmitted','NotCreated',NULL,NULL,NULL,NULL,'0316c3e0-df20-42db-bfba-b8e696fca532','72b22197fbae11e44e2a7784ec13aebbec3d2efc4b7d2063314a50d781ad471b','2026-11-18 03:21:43.243625'),(3,'KEN-261118-W2CLCB',14,2,1,30000.00,'kadiveti Narendra','kadivetinarendra2000@gmail.com','6300044926','PhD',NULL,'Karnataka - 530068','Approved',6,'2026-11-18 04:00:08.390934','2026-11-18 05:05:56.322540','KEN-261118-W2CLCB','2026-12-18 04:00:08.390785','e9d82f5b3b757cb70a835ba881c2dcf9cff9bdd98d44b6ee2ffb1dd9e45622b4','Verified','Active',22,'OrganizationAdmin:1','2026-11-18 05:00:10.406762',NULL,'2b58eb71-6465-418f-aa8b-9ce184041185','bf13f6767d8049bc0498fa6d245c67c48fc2379997c1994a040045e33478f514','2026-11-18 04:00:08.316474'),(4,'KEN-261118-PZK9J6',NULL,8,1,40000.00,'Rohit Sharma','mahesh@gmail.com','6873652695','Bachelor\'s Degree',NULL,'Telangana - 500872','PendingPayment',NULL,'2026-11-18 04:50:13.556066','2026-11-18 04:50:13.556126','KEN-261118-PZK9J6','2026-12-18 04:50:13.555875','033aa28e796c62e94bcc8973df6cc04d7de543641f040879903752a15056de9b','NotSubmitted','NotCreated',NULL,NULL,NULL,NULL,'494fc802-9cf0-432a-99c1-627e0dd9fdd2','83582d07155d8de13371c06f8e58d15a3a0a7e849aa75c5d6050718dc3e84f2d','2026-11-18 04:50:13.452527'),(5,'KEN-261118-WY9GVP',NULL,2,1,30000.00,'Suresh Raina','suresh@gmail.com','6734988252','Master\'s Degree',NULL,'Telangana - 500081','PendingPayment',6,'2026-11-18 05:41:59.163114','2026-11-18 05:41:59.163142','KEN-261118-WY9GVP','2026-12-18 05:41:59.163027','7a95e787b1587f420ce183e06ce8af2ffa25d0dfd741be8e94c17554fd61ef4a','NotSubmitted','NotCreated',NULL,NULL,NULL,NULL,'37dd2fd2-700e-473c-98d5-7d059834f184','673865210e859d924b260ac46583ec983ae7f813480b12ec56d82f73a53ce6e4','2026-11-18 05:41:59.067444'),(6,'KEN-261118-2HVWKA',15,2,1,30000.00,'kadiveti Naren','kadivetinarendra2104@gmail.com','6300044926','High School',NULL,'Karnataka - 530068','Approved',6,'2026-11-18 05:43:14.754586','2026-11-18 05:50:34.017203','KEN-261118-2HVWKA','2026-12-18 05:43:14.754582','7cb509589d8479350422bdcf65897a7de9d32a4890957fd0ad361658a04839a5','Verified','Active',23,'OrganizationAdmin:1','2026-11-18 05:49:54.814771',NULL,'81d463b2-0338-4b57-ac1d-f0ef1fea3fee','a2df8f1e7bf692e85806fb17d8a36327dd10ddf25f89c646b963c26876110b7d','2026-11-18 05:43:14.737484');
/*!40000 ALTER TABLE `courseenrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courselessons`
--

DROP TABLE IF EXISTS `courselessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courselessons` (
  `LessonId` int NOT NULL AUTO_INCREMENT,
  `TopicId` int NOT NULL,
  `LessonNumber` int NOT NULL,
  `LessonName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`LessonId`),
  KEY `IX_CourseLessons_TopicId` (`TopicId`),
  CONSTRAINT `FK_CourseLessons_CourseTopics_TopicId` FOREIGN KEY (`TopicId`) REFERENCES `coursetopics` (`TopicId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courselessons`
--

LOCK TABLES `courselessons` WRITE;
/*!40000 ALTER TABLE `courselessons` DISABLE KEYS */;
INSERT INTO `courselessons` VALUES (1,1,1,'What is React.js?','Understand React and component-based user interfaces.'),(2,1,2,'React Features','Learn declarative rendering, reusable components, and the virtual DOM.'),(3,1,3,'React Application Architecture','Understand the component tree and one-way data flow.'),(4,2,1,'Installing Node.js and Vite','Set up a React project using Node.js, npm, and Vite.'),(5,2,2,'React Project Structure','Explore the main files and folders in a React application.'),(6,2,3,'JSX Syntax','Write UI markup using JSX expressions and attributes.'),(7,3,1,'Functional Components','Create and reuse functional React components.'),(8,3,2,'Props','Pass data from parent to child components.'),(9,3,3,'Conditional Rendering','Display UI elements based on conditions.'),(10,3,4,'Rendering Lists and Keys','Render collections safely with unique keys.'),(11,4,1,'useState Hook','Manage local component state.'),(12,4,2,'Event Handling','Handle clicks, inputs, and other user interactions.'),(13,4,3,'Forms and Controlled Inputs','Build forms with controlled inputs and basic validation.'),(14,5,1,'useEffect Hook','Manage effects, subscriptions, and cleanup.'),(15,5,2,'useRef Hook','Access mutable values and DOM references.'),(16,5,3,'useMemo and useCallback','Understand memoization for selected performance needs.'),(17,5,4,'Custom Hooks','Extract reusable stateful logic into custom hooks.'),(18,6,1,'React Router','Configure routes, navigation, and route parameters.'),(19,6,2,'Context API','Share state without passing props through every level.'),(20,6,3,'State Management Basics','Understand when to use Context or a state management library.'),(21,7,1,'Fetching Data','Retrieve server data using fetch or Axios.'),(22,7,2,'Loading and Error States','Display loading indicators, empty states, and errors.'),(23,7,3,'CRUD Operations','Create, read, update, and delete records through APIs.'),(24,8,1,'CSS and Responsive Layouts','Style components using CSS and responsive design techniques.'),(25,8,2,'Tailwind CSS Basics','Build utility-first React layouts with Tailwind CSS.'),(26,8,3,'Reusable UI Components','Build forms, cards, modals, and tables with reusable patterns.'),(27,8,4,'Form Validation','Validate user input and display useful feedback.'),(28,9,1,'Lazy Loading and Suspense','Split application code and load routes on demand.'),(29,9,2,'React Performance','Identify unnecessary renders and optimize when needed.'),(30,9,3,'Component Testing','Write basic component tests with React Testing Library.'),(31,9,4,'Error Boundaries','Handle rendering failures with error boundaries.'),(32,10,1,'Authentication and Protected Routes','Understand login state and route protection in the frontend.'),(33,10,2,'Environment Variables','Configure public client-side environment values safely.'),(34,10,3,'Build and Deployment','Create production builds and deploy a React application.'),(35,10,4,'Final React Project','Develop and deploy a small React application with API integration.');
/*!40000 ALTER TABLE `courselessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coursemodules`
--

DROP TABLE IF EXISTS `coursemodules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coursemodules` (
  `ModuleId` int NOT NULL AUTO_INCREMENT,
  `CourseId` int NOT NULL,
  `ModuleNumber` int NOT NULL,
  `ModuleName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`ModuleId`),
  KEY `IX_CourseModules_CourseId` (`CourseId`),
  CONSTRAINT `FK_CourseModules_Courses_CourseId` FOREIGN KEY (`CourseId`) REFERENCES `courses` (`CourseId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coursemodules`
--

LOCK TABLES `coursemodules` WRITE;
/*!40000 ALTER TABLE `coursemodules` DISABLE KEYS */;
INSERT INTO `coursemodules` VALUES (1,1,1,'React.js Fundamentals','Introduction to React.js, modern frontend development, environment setup, and JSX.'),(2,1,2,'Components, Props and State','Build reusable components and manage interactive user interfaces.'),(3,1,3,'Hooks, Routing and State Management','Use React hooks, navigation, and shared application state.'),(4,1,4,'API Integration and UI Development','Connect React applications to backend APIs and build responsive interfaces.'),(5,1,5,'Advanced React, Testing and Deployment','Optimize, test, secure, and deploy a complete React application.');
/*!40000 ALTER TABLE `coursemodules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coursepayments`
--

DROP TABLE IF EXISTS `coursepayments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coursepayments` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `EnrollmentId` int NOT NULL,
  `UTRNumber` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Amount` decimal(18,2) NOT NULL,
  `PaymentDate` datetime(6) NOT NULL,
  `ScreenshotPath` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PaymentStatus` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `RejectionReason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `VerifiedBy` int DEFAULT NULL,
  `VerifiedAt` datetime(6) DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `PaymentMethod` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `ScreenshotContentType` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ScreenshotSizeBytes` bigint DEFAULT NULL,
  `ScreenshotSha256` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Remarks` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ReviewedBy` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IdempotencyKeyHash` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_CoursePayments_UTRNumber` (`UTRNumber`),
  UNIQUE KEY `IX_CoursePayments_IdempotencyKeyHash` (`IdempotencyKeyHash`),
  KEY `IX_CoursePayments_EnrollmentId_PaymentStatus` (`EnrollmentId`,`PaymentStatus`),
  KEY `IX_CoursePayments_VerifiedBy` (`VerifiedBy`),
  KEY `IX_CoursePayments_ScreenshotSha256` (`ScreenshotSha256`),
  CONSTRAINT `FK_CoursePayments_CourseEnrollments_EnrollmentId` FOREIGN KEY (`EnrollmentId`) REFERENCES `courseenrollments` (`Id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_CoursePayments_Users_VerifiedBy` FOREIGN KEY (`VerifiedBy`) REFERENCES `users` (`UserId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coursepayments`
--

LOCK TABLES `coursepayments` WRITE;
/*!40000 ALTER TABLE `coursepayments` DISABLE KEYS */;
INSERT INTO `coursepayments` VALUES (1,3,'106107844866',30000.00,'2026-11-18 00:00:00.000000','PaymentProofs/1/7a31a1fede4d411f9a4fbf826daf8115.jpg','Verified',NULL,NULL,'2026-11-18 04:04:21.200153','2026-11-18 04:03:20.680848','UPI','image/jpeg',59726,'0c66c618f91c57b9d2e9ff017bacc2e8cccb681a89798fd4b8e52379d178ffd2',NULL,'OrganizationAdmin:1','cf7c2c95249b55aae50fd9b965b4a6c987f3044453d570e49a861bbf05e6e639'),(2,6,'668835633718',30000.00,'2026-11-18 00:00:00.000000','PaymentProofs/1/dd768e0b4dbb49838bd68ce1b9ca17d0.jpg','Verified',NULL,NULL,'2026-11-18 05:49:06.065727','2026-11-18 05:47:57.527401','UPI','image/jpeg',59492,'8743ba3666c408dd53276869cb255cc781eea98630dd15bcb116925aae85563b',NULL,'OrganizationAdmin:1','7480a9ca6e7de82bbce140fb4a95e50e8b326e45e99af06ed9a3a5e4f6e45f62');
/*!40000 ALTER TABLE `coursepayments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `CourseId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `CourseName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CourseCode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Duration` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Price` decimal(18,2) NOT NULL,
  `PdfUrl` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Status` tinyint(1) NOT NULL,
  `IsPublic` tinyint(1) NOT NULL,
  `IsArchived` tinyint(1) NOT NULL,
  `MentorId` int DEFAULT NULL,
  `PosterUrl` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`CourseId`),
  KEY `IX_Courses_MentorId` (`MentorId`),
  KEY `IX_Courses_OrganizationId_CourseName` (`OrganizationId`,`CourseName`),
  CONSTRAINT `FK_Courses_Mentors_MentorId` FOREIGN KEY (`MentorId`) REFERENCES `mentors` (`MentorId`),
  CONSTRAINT `FK_Courses_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,1,'React.js','',NULL,'3 Months','Intermediate',25000.00,'/coursepdfs/c573107e-bcd4-43fe-9a1c-d8cb12e1924e.pdf',1,1,0,NULL,NULL),(2,1,'Python','',NULL,'3 Months','Advanced',30000.00,'/coursepdfs/084390d9-4990-4429-911d-9b11020a7876.pdf',1,1,0,NULL,NULL),(3,1,'Java Full Stack','',NULL,'3 Months','Intermediate',26500.00,'/coursepdfs/926f142a-18c4-4209-8bc4-bc5626dabece.pdf',1,1,0,NULL,NULL),(4,1,'RPA','',NULL,'2 Months','Intermediate',20000.00,'/coursepdfs/842f7a80-95c1-45fb-b336-fb5a77504bb6.pdf',1,1,0,NULL,NULL),(5,1,'Cybersecurity','',NULL,'3 Months','Advanced',36000.00,'/coursepdfs/a449314b-decc-493a-8c24-f21130a72174.pdf',1,1,0,NULL,'/uploads/course-posters/5_19b2347c75a84a8da08d31b2fe59428e.jpg'),(6,1,'mvc','',NULL,'1 Month','Beginner',30000.00,NULL,0,0,0,NULL,NULL),(7,1,'Devops','',NULL,'3 Months','Beginner',45000.00,NULL,1,1,0,NULL,NULL),(8,1,'MVC','',NULL,'2 Months','Beginner',40000.00,NULL,1,1,0,NULL,NULL),(9,1,'ML','',NULL,'4 Months','Beginner',30000.00,'/coursepdfs/082795cd-6e01-4976-a434-92f29bbab2fc.pdf',1,1,0,NULL,NULL),(10,1,'typescript','',NULL,'1 Month','Beginner',25000.00,NULL,1,1,0,NULL,'/uploads/course-posters/10_a3356a6f38024217b5f53c77816f5b2c.png');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coursetopics`
--

DROP TABLE IF EXISTS `coursetopics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coursetopics` (
  `TopicId` int NOT NULL AUTO_INCREMENT,
  `ModuleId` int NOT NULL,
  `TopicNumber` int NOT NULL,
  `TopicName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`TopicId`),
  KEY `IX_CourseTopics_ModuleId` (`ModuleId`),
  CONSTRAINT `FK_CourseTopics_CourseModules_ModuleId` FOREIGN KEY (`ModuleId`) REFERENCES `coursemodules` (`ModuleId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coursetopics`
--

LOCK TABLES `coursetopics` WRITE;
/*!40000 ALTER TABLE `coursetopics` DISABLE KEYS */;
INSERT INTO `coursetopics` VALUES (1,1,1,'Introduction to React.js',NULL),(2,1,2,'Environment Setup and JSX',NULL),(3,2,1,'React Components',NULL),(4,2,2,'State and Events',NULL),(5,3,1,'React Hooks',NULL),(6,3,2,'Routing and Shared State',NULL),(7,4,1,'Working with APIs',NULL),(8,4,2,'Styling and Reusable UI',NULL),(9,5,1,'Performance and Quality',NULL),(10,5,2,'Production and Project',NULL);
/*!40000 ALTER TABLE `coursetopics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `DepartmentId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `Name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ManagerId` int DEFAULT NULL,
  `BranchId` int DEFAULT NULL,
  PRIMARY KEY (`DepartmentId`),
  KEY `IX_Departments_BranchId` (`BranchId`),
  KEY `IX_Departments_ManagerId` (`ManagerId`),
  KEY `IX_Departments_OrganizationId` (`OrganizationId`),
  CONSTRAINT `FK_Departments_Branches_BranchId` FOREIGN KEY (`BranchId`) REFERENCES `branches` (`BranchId`),
  CONSTRAINT `FK_Departments_Employees_ManagerId` FOREIGN KEY (`ManagerId`) REFERENCES `employees` (`EmployeeId`),
  CONSTRAINT `FK_Departments_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employeeattendances`
--

DROP TABLE IF EXISTS `employeeattendances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employeeattendances` (
  `EmployeeAttendanceId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `EmployeeId` int NOT NULL,
  `AttendanceDate` date NOT NULL,
  `CheckIn` datetime(6) DEFAULT NULL,
  `CheckOut` datetime(6) DEFAULT NULL,
  `WorkingHours` decimal(5,2) NOT NULL,
  `Status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IsLateCheckout` tinyint(1) NOT NULL,
  `Remarks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `IsDeleted` tinyint(1) NOT NULL,
  `DeletedOn` datetime(6) DEFAULT NULL,
  `DeletedBy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`EmployeeAttendanceId`),
  UNIQUE KEY `IX_EmployeeAttendances_OrganizationId_EmployeeId_AttendanceDate` (`OrganizationId`,`EmployeeId`,`AttendanceDate`),
  KEY `IX_EmployeeAttendances_EmployeeId` (`EmployeeId`),
  CONSTRAINT `FK_EmployeeAttendances_Employees_EmployeeId` FOREIGN KEY (`EmployeeId`) REFERENCES `employees` (`EmployeeId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_EmployeeAttendances_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeeattendances`
--

LOCK TABLES `employeeattendances` WRITE;
/*!40000 ALTER TABLE `employeeattendances` DISABLE KEYS */;
INSERT INTO `employeeattendances` VALUES (1,1,1,'2026-11-02','2026-11-02 17:46:11.939603',NULL,0.00,'Pending',0,NULL,0,NULL,NULL),(2,1,1,'2026-11-10','2026-11-10 14:37:29.397342',NULL,0.00,'LateCheckout',1,'Late checkout: employee did not check out by 6:15 PM.',0,NULL,NULL),(3,1,7,'2026-11-18','2026-11-18 14:37:50.169625',NULL,0.00,'LateCheckout',1,'Late checkout: employee did not check out by 6:15 PM.',0,NULL,NULL);
/*!40000 ALTER TABLE `employeeattendances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employeedocuments`
--

DROP TABLE IF EXISTS `employeedocuments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employeedocuments` (
  `EmployeeDocumentId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `EmployeeProfileId` int NOT NULL,
  `Category` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DocumentType` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `OriginalFileName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `StoredFileName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `StoredFilePath` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ContentType` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `FileSize` bigint NOT NULL,
  `UploadedAt` datetime(6) NOT NULL,
  `IsDeleted` tinyint(1) NOT NULL,
  `DeletedOn` datetime(6) DEFAULT NULL,
  `DeletedBy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`EmployeeDocumentId`),
  KEY `IX_EmployeeDocuments_EmployeeProfileId` (`EmployeeProfileId`),
  KEY `IX_EmployeeDocuments_OrganizationId_EmployeeProfileId_DocumentT~` (`OrganizationId`,`EmployeeProfileId`,`DocumentType`),
  CONSTRAINT `FK_EmployeeDocuments_EmployeeProfiles_EmployeeProfileId` FOREIGN KEY (`EmployeeProfileId`) REFERENCES `employeeprofiles` (`EmployeeProfileId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeedocuments`
--

LOCK TABLES `employeedocuments` WRITE;
/*!40000 ALTER TABLE `employeedocuments` DISABLE KEYS */;
/*!40000 ALTER TABLE `employeedocuments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employeeeducations`
--

DROP TABLE IF EXISTS `employeeeducations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employeeeducations` (
  `EmployeeEducationId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `EmployeeProfileId` int NOT NULL,
  `Qualification` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `University` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Year` int DEFAULT NULL,
  `Percentage` decimal(5,2) DEFAULT NULL,
  `Specialization` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `IsDeleted` tinyint(1) NOT NULL,
  `DeletedOn` datetime(6) DEFAULT NULL,
  `DeletedBy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`EmployeeEducationId`),
  KEY `IX_EmployeeEducations_EmployeeProfileId` (`EmployeeProfileId`),
  KEY `IX_EmployeeEducations_OrganizationId_EmployeeProfileId` (`OrganizationId`,`EmployeeProfileId`),
  CONSTRAINT `FK_EmployeeEducations_EmployeeProfiles_EmployeeProfileId` FOREIGN KEY (`EmployeeProfileId`) REFERENCES `employeeprofiles` (`EmployeeProfileId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeeeducations`
--

LOCK TABLES `employeeeducations` WRITE;
/*!40000 ALTER TABLE `employeeeducations` DISABLE KEYS */;
/*!40000 ALTER TABLE `employeeeducations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employeeperformances`
--

DROP TABLE IF EXISTS `employeeperformances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employeeperformances` (
  `PerformanceId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `EmployeeId` int NOT NULL,
  `Period` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PerformanceScore` decimal(5,2) NOT NULL,
  `TargetCompletion` decimal(5,2) NOT NULL,
  `Attendance` decimal(5,2) NOT NULL,
  `Notes` varchar(4000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL,
  `DeletedOn` datetime(6) DEFAULT NULL,
  `DeletedBy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`PerformanceId`),
  KEY `IX_EmployeePerformances_EmployeeId` (`EmployeeId`),
  KEY `IX_EmployeePerformances_OrganizationId_EmployeeId_Period` (`OrganizationId`,`EmployeeId`,`Period`),
  CONSTRAINT `FK_EmployeePerformances_Employees_EmployeeId` FOREIGN KEY (`EmployeeId`) REFERENCES `employees` (`EmployeeId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_EmployeePerformances_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeeperformances`
--

LOCK TABLES `employeeperformances` WRITE;
/*!40000 ALTER TABLE `employeeperformances` DISABLE KEYS */;
/*!40000 ALTER TABLE `employeeperformances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employeepermissions`
--

DROP TABLE IF EXISTS `employeepermissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employeepermissions` (
  `EmployeePermissionId` int NOT NULL AUTO_INCREMENT,
  `EmployeeId` int NOT NULL,
  `PermissionId` int NOT NULL,
  `CanView` tinyint(1) NOT NULL,
  `CanAdd` tinyint(1) NOT NULL,
  `CanEdit` tinyint(1) NOT NULL,
  `CanDelete` tinyint(1) NOT NULL,
  `CanAccess` tinyint(1) NOT NULL,
  PRIMARY KEY (`EmployeePermissionId`),
  UNIQUE KEY `IX_EmployeePermissions_EmployeeId_PermissionId` (`EmployeeId`,`PermissionId`),
  KEY `IX_EmployeePermissions_PermissionId` (`PermissionId`),
  CONSTRAINT `FK_EmployeePermissions_Employees_EmployeeId` FOREIGN KEY (`EmployeeId`) REFERENCES `employees` (`EmployeeId`) ON DELETE CASCADE,
  CONSTRAINT `FK_EmployeePermissions_Permissions_PermissionId` FOREIGN KEY (`PermissionId`) REFERENCES `permissions` (`PermissionId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeepermissions`
--

LOCK TABLES `employeepermissions` WRITE;
/*!40000 ALTER TABLE `employeepermissions` DISABLE KEYS */;
INSERT INTO `employeepermissions` VALUES (1,1,1,1,1,1,1,1),(2,1,2,1,1,1,1,1),(3,1,3,1,1,1,1,1),(4,1,4,1,1,1,1,1),(5,1,5,1,1,1,1,1),(6,1,6,1,1,1,1,1),(7,1,7,1,1,1,1,1),(8,1,8,1,1,1,1,1),(9,1,9,1,1,1,1,1),(10,1,10,1,1,1,1,1),(11,1,11,1,1,1,1,1),(12,1,12,1,1,1,1,1),(13,1,13,1,1,1,1,1),(14,1,14,1,1,1,1,1),(15,1,15,1,1,1,1,1),(16,1,17,1,1,1,1,1),(17,5,1,1,1,1,1,1),(18,5,2,1,1,1,1,1),(19,5,3,1,1,1,1,1),(20,5,4,1,1,1,1,1),(21,5,5,1,1,1,1,1),(22,5,6,1,1,1,1,1),(23,5,7,1,1,1,1,1),(24,5,8,1,1,1,1,1),(25,5,9,1,1,1,1,1),(26,5,10,1,1,1,1,1),(27,5,11,1,1,1,1,1),(28,5,12,1,1,1,1,1),(29,5,13,1,1,1,1,1),(30,5,14,1,1,1,1,1),(31,5,15,1,1,1,1,1),(32,5,17,1,1,1,1,1),(33,5,18,1,1,1,1,1),(34,7,1,1,1,1,1,1),(35,7,2,1,1,1,1,1),(36,7,3,1,1,1,1,1),(37,7,4,1,1,1,1,1),(38,7,5,1,1,1,1,1),(39,7,6,1,1,1,1,1),(40,7,7,1,1,1,1,1),(41,7,8,1,1,1,1,1),(42,7,9,1,1,1,1,1),(43,7,10,1,1,1,1,1),(44,7,11,1,1,1,1,1),(45,7,12,1,1,1,1,1),(46,7,13,1,1,1,1,1),(47,7,14,1,1,1,1,1),(48,7,15,1,1,1,1,1),(49,7,17,1,1,1,1,1),(50,7,18,1,1,1,1,1),(51,8,1,1,0,0,0,0),(52,8,2,1,0,0,0,0),(53,8,3,1,0,0,0,0),(54,8,4,1,0,0,0,0),(55,8,5,1,0,0,0,0),(56,8,6,1,0,0,0,0),(57,8,7,1,0,0,0,0),(58,8,8,1,0,0,0,0),(59,8,9,1,0,0,0,0),(60,8,10,1,0,0,0,0),(61,8,11,1,0,0,0,0),(62,8,12,1,0,0,0,0),(63,8,13,1,0,0,0,0),(64,8,14,1,0,0,0,0),(65,8,15,1,0,0,0,0),(66,8,17,1,0,0,0,0),(67,8,18,1,0,0,0,0);
/*!40000 ALTER TABLE `employeepermissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employeeprofiles`
--

DROP TABLE IF EXISTS `employeeprofiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employeeprofiles` (
  `EmployeeProfileId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `EmployeeId` int NOT NULL,
  `EmployeeCode` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `MiddleName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `Gender` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `MaritalStatus` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `DateOfBirth` datetime(6) DEFAULT NULL,
  `AadhaarNumber` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `PanNumber` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `BloodGroup` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `HouseNumber` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `StreetArea` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `CityVillage` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `District` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `State` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `Country` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `Pincode` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `DepartmentId` int DEFAULT NULL,
  `Designation` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `JoiningDate` datetime(6) DEFAULT NULL,
  `CustomerId` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `BankName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `AccountHolderName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `AccountNumber` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `IFSCCode` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `BranchName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `UANNumber` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `PFAccountNumber` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `AnnualCtc` decimal(18,2) DEFAULT NULL,
  `BasicSalaryMonthly` decimal(18,2) DEFAULT NULL,
  `HraMonthly` decimal(18,2) DEFAULT NULL,
  `ConveyanceAllowanceMonthly` decimal(18,2) DEFAULT NULL,
  `MedicalAllowanceMonthly` decimal(18,2) DEFAULT NULL,
  `SpecialAllowanceMonthly` decimal(18,2) DEFAULT NULL,
  `EmployeePfMonthly` decimal(18,2) DEFAULT NULL,
  `EmployerPfMonthly` decimal(18,2) DEFAULT NULL,
  `ProfessionalTaxMonthly` decimal(18,2) DEFAULT NULL,
  `TdsMonthly` decimal(18,2) DEFAULT NULL,
  `OtherDeductionMonthly` decimal(18,2) DEFAULT NULL,
  `CreatedDate` datetime(6) NOT NULL,
  `UpdatedDate` datetime(6) NOT NULL,
  `IsDeleted` tinyint(1) NOT NULL,
  `DeletedOn` datetime(6) DEFAULT NULL,
  `DeletedBy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`EmployeeProfileId`),
  UNIQUE KEY `IX_EmployeeProfiles_OrganizationId_EmployeeId` (`OrganizationId`,`EmployeeId`),
  KEY `IX_EmployeeProfiles_DepartmentId` (`DepartmentId`),
  KEY `IX_EmployeeProfiles_EmployeeId` (`EmployeeId`),
  CONSTRAINT `FK_EmployeeProfiles_Departments_DepartmentId` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`DepartmentId`) ON DELETE SET NULL,
  CONSTRAINT `FK_EmployeeProfiles_Employees_EmployeeId` FOREIGN KEY (`EmployeeId`) REFERENCES `employees` (`EmployeeId`) ON DELETE CASCADE,
  CONSTRAINT `FK_EmployeeProfiles_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeeprofiles`
--

LOCK TABLES `employeeprofiles` WRITE;
/*!40000 ALTER TABLE `employeeprofiles` DISABLE KEYS */;
INSERT INTO `employeeprofiles` VALUES (1,1,5,'P5',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-05 12:14:38.599873','2026-11-05 12:14:38.600013',0,NULL,NULL),(2,1,1,'P1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-11 06:40:15.485228','2026-11-11 07:13:28.554462',0,NULL,NULL),(3,1,7,'P7',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-18 06:28:22.267929','2026-11-18 06:28:22.268093',0,NULL,NULL),(4,1,6,'P6',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-18 00:00:00.000000',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-18 15:14:04.978243','2026-11-18 15:14:04.978245',0,NULL,NULL);
/*!40000 ALTER TABLE `employeeprofiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `EmployeeId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `UserId` int DEFAULT NULL,
  `FirstName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `LastName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Phone` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Role` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `EmployeeType` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PasswordHash` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ProfilePhotoUrl` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `GoogleSubjectId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DepartmentId` int DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL,
  `DeletedOn` datetime(6) DEFAULT NULL,
  `DeletedBy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`EmployeeId`),
  UNIQUE KEY `IX_Employees_GoogleSubjectId` (`GoogleSubjectId`),
  UNIQUE KEY `IX_Employees_UserId` (`UserId`),
  KEY `IX_Employees_DepartmentId` (`DepartmentId`),
  KEY `IX_Employees_Email` (`Email`),
  KEY `IX_Employees_OrganizationId_Email` (`OrganizationId`,`Email`),
  CONSTRAINT `FK_Employees_Departments_DepartmentId` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`DepartmentId`),
  CONSTRAINT `FK_Employees_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_Employees_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`UserId`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,1,1,'MAHESH','MAHI','maherishi31@gmail.com','','Mentor','Active','Full-time','$2a$11$lsG0vvDynrRRj99QFafYceJx48tuwy2udNkrCcxDhBtXKIozDdiWW',NULL,NULL,NULL,0,NULL,NULL),(2,1,2,'MANI TEJA','PULLIIIIII','maniteja123@gmail.com','7577638938','Mentor','Active','Full-time','$2a$11$hRfmup8Yq7/F2.kgYPQogeoR9wA1C2P5.GJJfDo/QwmlKRWXGIkgC',NULL,NULL,NULL,0,NULL,NULL),(3,1,3,'nani','hari','nani12@gmail.com','6474738829','Mentor','Active','Full-time','$2a$11$em0r044pxZsTDXv8IcObOO1gg3qRq58EYkfJWaXhyg0lQdcVckRyq',NULL,NULL,NULL,0,NULL,NULL),(4,1,4,'narendra','krishna','narendrakrishna@gmail.com','8974774747','Mentor','Active','Full-time','$2a$11$qiRbtQCbRg6H7dlwEB.4le4yh26H4rJrOgOK84dGpbvX/Xx4nOMf.',NULL,NULL,NULL,0,NULL,NULL),(5,1,12,'poorna','Bhai','srinivasarepally79@gmail.com','8599588576','HR','Active','Full-time','$2a$11$.hXhSb8CQKek7dKcWB7rY.yFH4I3rn1swsjUig6tfXEHVrp6I.Mzq','/uploads/profile-photos/employee/5_723db13a883e42259b5abf3281ae1825.png',NULL,NULL,0,NULL,NULL),(6,1,13,'Luna','Grace','lunagrace123@gmail.com','9989225788','Mentor','Active','Full-time','$2a$11$/myt2hlsG53DTddmcgwth.D5.2DmJUocrVDyVKR9ORTo8dfdSme4i',NULL,NULL,NULL,0,NULL,NULL),(7,1,14,'Hima','Gandikota','himagandikota123@gmail.com','9879564731','Mentor','Active','Full-time','$2a$11$bYwHSMhRJnTMTESQh/ZgduAnppJOdfSj.CIdNhVE6rJbojsC0mIDO',NULL,NULL,NULL,0,NULL,NULL),(8,1,17,'Bhuvan','Dontala','bhuvandontala123@gmail.com','9242678589','HR','Active','Full-time','$2a$11$V4awl8IWkKvyJvHqU9v7UuKIAn3Z7KbszQMsiaWXk84jvcxrTroT2',NULL,NULL,NULL,0,NULL,NULL),(9,1,24,'Mani','Teja','mani@gmail.com','9871442345','Mentor','Active','Part-Time','$2a$11$ASHiIQ88ZA/ntclYyhEIBeM5F14WpVm9OURYKUCjftNEQ2PtTF1te',NULL,NULL,NULL,0,NULL,NULL),(10,1,25,'kadiveti','narenhshd','kadivetinarendra214@gmail.com','7281772187','Mentor','Active','Full-time','$2a$11$UvCccAEozz4HLzvzUo62C.9p9hJGnhH9QJ9BrI.g/zLlccwOfGqfC',NULL,NULL,NULL,0,NULL,NULL);
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employeeskills`
--

DROP TABLE IF EXISTS `employeeskills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employeeskills` (
  `EmployeeSkillId` int NOT NULL AUTO_INCREMENT,
  `EmployeeId` int NOT NULL,
  `SkillId` int NOT NULL,
  `Level` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Verified` tinyint(1) NOT NULL,
  PRIMARY KEY (`EmployeeSkillId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeeskills`
--

LOCK TABLES `employeeskills` WRITE;
/*!40000 ALTER TABLE `employeeskills` DISABLE KEYS */;
/*!40000 ALTER TABLE `employeeskills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employeeworkexperiences`
--

DROP TABLE IF EXISTS `employeeworkexperiences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employeeworkexperiences` (
  `EmployeeWorkExperienceId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `EmployeeProfileId` int NOT NULL,
  `CompanyName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Designation` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `FromDate` datetime(6) DEFAULT NULL,
  `ToDate` datetime(6) DEFAULT NULL,
  `YearsOfExperience` decimal(6,2) DEFAULT NULL,
  `ReasonForLeaving` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `Description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `IsDeleted` tinyint(1) NOT NULL,
  `DeletedOn` datetime(6) DEFAULT NULL,
  `DeletedBy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`EmployeeWorkExperienceId`),
  KEY `IX_EmployeeWorkExperiences_EmployeeProfileId` (`EmployeeProfileId`),
  KEY `IX_EmployeeWorkExperiences_OrganizationId_EmployeeProfileId` (`OrganizationId`,`EmployeeProfileId`),
  CONSTRAINT `FK_EmployeeWorkExperiences_EmployeeProfiles_EmployeeProfileId` FOREIGN KEY (`EmployeeProfileId`) REFERENCES `employeeprofiles` (`EmployeeProfileId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeeworkexperiences`
--

LOCK TABLES `employeeworkexperiences` WRITE;
/*!40000 ALTER TABLE `employeeworkexperiences` DISABLE KEYS */;
/*!40000 ALTER TABLE `employeeworkexperiences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollmentapprovalhistory`
--

DROP TABLE IF EXISTS `enrollmentapprovalhistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollmentapprovalhistory` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `EnrollmentId` int NOT NULL,
  `Action` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ActionBy` int DEFAULT NULL,
  `Remarks` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `Actor` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `FromStatus` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ToStatus` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_EnrollmentApprovalHistory_ActionBy` (`ActionBy`),
  KEY `IX_EnrollmentApprovalHistory_EnrollmentId_CreatedAt` (`EnrollmentId`,`CreatedAt`),
  CONSTRAINT `FK_EnrollmentApprovalHistory_CourseEnrollments_EnrollmentId` FOREIGN KEY (`EnrollmentId`) REFERENCES `courseenrollments` (`Id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_EnrollmentApprovalHistory_Users_ActionBy` FOREIGN KEY (`ActionBy`) REFERENCES `users` (`UserId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollmentapprovalhistory`
--

LOCK TABLES `enrollmentapprovalhistory` WRITE;
/*!40000 ALTER TABLE `enrollmentapprovalhistory` DISABLE KEYS */;
INSERT INTO `enrollmentapprovalhistory` VALUES (1,1,'Created',NULL,NULL,'2026-11-18 03:14:18.242724','Public',NULL,'PendingPayment|NotSubmitted|NotCreated'),(2,1,'CreateReplayed',NULL,NULL,'2026-11-18 03:14:24.065225','Public','PendingPayment|NotSubmitted|NotCreated','PendingPayment|NotSubmitted|NotCreated'),(3,2,'Created',NULL,NULL,'2026-11-18 03:21:43.276959','Public',NULL,'PendingPayment|NotSubmitted|NotCreated'),(4,3,'Created',NULL,NULL,'2026-11-18 04:00:08.604601','Public',NULL,'PendingPayment|NotSubmitted|NotCreated'),(5,3,'PaymentSubmitted',NULL,NULL,'2026-11-18 04:03:20.703174','Public','PendingPayment|NotSubmitted|NotCreated','PendingPayment|PendingVerification|NotCreated'),(6,3,'PaymentVerified',NULL,NULL,'2026-11-18 04:04:21.200462','OrganizationAdmin:1','PendingPayment|PendingVerification|NotCreated','PendingApproval|Verified|NotCreated'),(7,4,'Created',NULL,NULL,'2026-11-18 04:50:13.794622','Public',NULL,'PendingPayment|NotSubmitted|NotCreated'),(8,3,'Approved',NULL,NULL,'2026-11-18 05:00:10.408118','OrganizationAdmin:1','PendingApproval|Verified|NotCreated','Approved|Verified|PendingSetup'),(9,3,'AccountActivated',NULL,NULL,'2026-11-18 05:05:56.322536','User:22','Approved|Verified|PendingSetup','Approved|Verified|Active'),(10,5,'Created',NULL,NULL,'2026-11-18 05:41:59.306300','Public',NULL,'PendingPayment|NotSubmitted|NotCreated'),(11,6,'Created',NULL,NULL,'2026-11-18 05:43:14.756423','Public',NULL,'PendingPayment|NotSubmitted|NotCreated'),(12,6,'PaymentSubmitted',NULL,NULL,'2026-11-18 05:47:57.548057','Public','PendingPayment|NotSubmitted|NotCreated','PendingPayment|PendingVerification|NotCreated'),(13,6,'PaymentVerified',NULL,NULL,'2026-11-18 05:49:06.066112','OrganizationAdmin:1','PendingPayment|PendingVerification|NotCreated','PendingApproval|Verified|NotCreated'),(14,6,'Approved',NULL,NULL,'2026-11-18 05:49:54.815358','OrganizationAdmin:1','PendingApproval|Verified|NotCreated','Approved|Verified|PendingSetup'),(15,6,'AccountActivated',NULL,NULL,'2026-11-18 05:50:34.017200','User:23','Approved|Verified|PendingSetup','Approved|Verified|Active');
/*!40000 ALTER TABLE `enrollmentapprovalhistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `get_in_touches`
--

DROP TABLE IF EXISTS `get_in_touches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `get_in_touches` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Email` varchar(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `MobileNumber` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Subject` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Message` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CreatedDate` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_get_in_touches_CreatedDate` (`CreatedDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `get_in_touches`
--

LOCK TABLES `get_in_touches` WRITE;
/*!40000 ALTER TABLE `get_in_touches` DISABLE KEYS */;
/*!40000 ALTER TABLE `get_in_touches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `goals`
--

DROP TABLE IF EXISTS `goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `goals` (
  `GoalId` int NOT NULL AUTO_INCREMENT,
  `Title` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `OwnerId` int NOT NULL,
  `Quarter` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`GoalId`),
  KEY `IX_Goals_OwnerId` (`OwnerId`),
  CONSTRAINT `FK_Goals_Employees_OwnerId` FOREIGN KEY (`OwnerId`) REFERENCES `employees` (`EmployeeId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goals`
--

LOCK TABLES `goals` WRITE;
/*!40000 ALTER TABLE `goals` DISABLE KEYS */;
/*!40000 ALTER TABLE `goals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrannouncements`
--

DROP TABLE IF EXISTS `hrannouncements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrannouncements` (
  `AnnouncementId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `Title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Audience` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PublishDate` datetime(6) NOT NULL,
  `ExpiryDate` datetime(6) DEFAULT NULL,
  `CreatedByEmployeeId` int DEFAULT NULL,
  `CreatedBy` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IsDeleted` tinyint(1) NOT NULL,
  `DeletedOn` datetime(6) DEFAULT NULL,
  `DeletedBy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`AnnouncementId`),
  KEY `IX_HrAnnouncements_OrganizationId_PublishDate` (`OrganizationId`,`PublishDate`),
  KEY `IX_HrAnnouncements_OrganizationId_Status` (`OrganizationId`,`Status`),
  CONSTRAINT `FK_HrAnnouncements_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrannouncements`
--

LOCK TABLES `hrannouncements` WRITE;
/*!40000 ALTER TABLE `hrannouncements` DISABLE KEYS */;
INSERT INTO `hrannouncements` VALUES (1,1,'Tomorrow holiday','hgdjasgk','Mentor','PUBLISHED','2026-11-14 04:20:00.000000','2026-11-15 04:20:00.000000',5,'poorna Bhai',1,'2026-11-18 11:12:33.086002','System'),(2,1,'Test purpose','jhsaas','Mentor','PUBLISHED','2026-11-13 04:24:00.000000','2026-11-14 04:24:00.000000',5,'poorna Bhai',1,'2026-11-13 05:01:26.598391','System'),(3,1,'today holoiday','hii','Mentor','PUBLISHED','2026-11-13 05:06:00.000000','2026-11-14 05:06:00.000000',5,'poorna Bhai',0,NULL,NULL),(4,1,'Work from home','Tomorrow work from home','Mentor','PUBLISHED','2026-11-19 09:56:00.000000','2026-11-19 10:03:00.000000',5,'poorna Bhai',0,NULL,NULL),(5,1,'based on classs','hii mentors','Mentor','PUBLISHED','2026-11-18 10:43:00.000000','2026-11-19 10:43:00.000000',5,'poorna Bhai',0,NULL,NULL),(6,1,'ht mentor','hii mentor','Mentor','PUBLISHED','2026-11-18 10:44:00.000000','2026-11-18 11:45:00.000000',5,'poorna Bhai',0,NULL,NULL);
/*!40000 ALTER TABLE `hrannouncements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrcalendarevents`
--

DROP TABLE IF EXISTS `hrcalendarevents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrcalendarevents` (
  `EventId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `EventType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` varchar(4000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `StartDateTime` datetime(6) NOT NULL,
  `EndDateTime` datetime(6) NOT NULL,
  `Location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MeetingLink` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AllDay` tinyint(1) NOT NULL,
  `Color` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CourseId` int DEFAULT NULL,
  `BatchId` int DEFAULT NULL,
  `EmployeeId` int DEFAULT NULL,
  `StudentId` int DEFAULT NULL,
  `CreatedBy` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CreatedDate` datetime(6) NOT NULL,
  `UpdatedDate` datetime(6) DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL,
  `DeletedOn` datetime(6) DEFAULT NULL,
  `DeletedBy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`EventId`),
  KEY `IX_HrCalendarEvents_BatchId` (`BatchId`),
  KEY `IX_HrCalendarEvents_CourseId` (`CourseId`),
  KEY `IX_HrCalendarEvents_EmployeeId` (`EmployeeId`),
  KEY `IX_HrCalendarEvents_OrganizationId_EventType` (`OrganizationId`,`EventType`),
  KEY `IX_HrCalendarEvents_OrganizationId_StartDateTime` (`OrganizationId`,`StartDateTime`),
  KEY `IX_HrCalendarEvents_StudentId` (`StudentId`),
  CONSTRAINT `FK_HrCalendarEvents_Batches_BatchId` FOREIGN KEY (`BatchId`) REFERENCES `batches` (`BatchId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_HrCalendarEvents_Courses_CourseId` FOREIGN KEY (`CourseId`) REFERENCES `courses` (`CourseId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_HrCalendarEvents_Employees_EmployeeId` FOREIGN KEY (`EmployeeId`) REFERENCES `employees` (`EmployeeId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_HrCalendarEvents_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_HrCalendarEvents_Students_StudentId` FOREIGN KEY (`StudentId`) REFERENCES `students` (`StudentId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrcalendarevents`
--

LOCK TABLES `hrcalendarevents` WRITE;
/*!40000 ALTER TABLE `hrcalendarevents` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrcalendarevents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrresources`
--

DROP TABLE IF EXISTS `hrresources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrresources` (
  `ResourceId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `Name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` varchar(4000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `FileType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `OriginalFileName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `StoredFileName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `StoredFilePath` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UploadedBy` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UploadedByEmployeeId` int DEFAULT NULL,
  `FileSize` bigint NOT NULL,
  `UploadedDate` datetime(6) NOT NULL,
  `IsDeleted` tinyint(1) NOT NULL,
  `DeletedOn` datetime(6) DEFAULT NULL,
  `DeletedBy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`ResourceId`),
  KEY `IX_HrResources_OrganizationId_Category` (`OrganizationId`,`Category`),
  KEY `IX_HrResources_OrganizationId_UploadedByEmployeeId` (`OrganizationId`,`UploadedByEmployeeId`),
  CONSTRAINT `FK_HrResources_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrresources`
--

LOCK TABLES `hrresources` WRITE;
/*!40000 ALTER TABLE `hrresources` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrresources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrsettings`
--

DROP TABLE IF EXISTS `hrsettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrsettings` (
  `HrSettingsId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `EmployeeId` int NOT NULL,
  `LeaveRequests` tinyint(1) NOT NULL,
  `AttendanceAlerts` tinyint(1) NOT NULL,
  `EmployeeUpdates` tinyint(1) NOT NULL,
  `BatchScheduleUpdates` tinyint(1) NOT NULL,
  `PerformanceUpdates` tinyint(1) NOT NULL,
  `InstituteAnnouncements` tinyint(1) NOT NULL,
  `DarkMode` tinyint(1) NOT NULL,
  `CompactView` tinyint(1) NOT NULL,
  `SidebarCollapsedByDefault` tinyint(1) NOT NULL,
  `AccentColor` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PhotoUrl` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TwoFactorEnabled` tinyint(1) NOT NULL,
  `CreatedDate` datetime(6) NOT NULL,
  `UpdatedDate` datetime(6) NOT NULL,
  `IsDeleted` tinyint(1) NOT NULL,
  `DeletedOn` datetime(6) DEFAULT NULL,
  `DeletedBy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`HrSettingsId`),
  UNIQUE KEY `IX_HrSettings_OrganizationId_EmployeeId` (`OrganizationId`,`EmployeeId`),
  KEY `IX_HrSettings_EmployeeId` (`EmployeeId`),
  CONSTRAINT `FK_HrSettings_Employees_EmployeeId` FOREIGN KEY (`EmployeeId`) REFERENCES `employees` (`EmployeeId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_HrSettings_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrsettings`
--

LOCK TABLES `hrsettings` WRITE;
/*!40000 ALTER TABLE `hrsettings` DISABLE KEYS */;
INSERT INTO `hrsettings` VALUES (1,1,5,1,1,1,1,0,1,0,0,0,'#2563eb',NULL,0,'2026-11-18 11:24:11.529811','2026-11-18 11:24:11.529961',0,NULL,NULL);
/*!40000 ALTER TABLE `hrsettings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `InvoiceId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `InvoiceNumber` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `StudentId` int NOT NULL,
  `CourseId` int NOT NULL,
  `BillingAddress` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PlaceOfSupply` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `TaxType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SubTotal` decimal(18,2) NOT NULL,
  `DiscountAmount` decimal(18,2) NOT NULL,
  `TaxableAmount` decimal(18,2) NOT NULL,
  `TaxPercentage` decimal(5,2) NOT NULL,
  `TaxAmount` decimal(18,2) NOT NULL,
  `TotalAmount` decimal(18,2) NOT NULL,
  `PaidAmount` decimal(18,2) NOT NULL,
  `BalanceAmount` decimal(18,2) NOT NULL,
  `IssueDate` datetime(6) NOT NULL,
  `DueDate` datetime(6) NOT NULL,
  `PaidDate` datetime(6) DEFAULT NULL,
  `CancelledDate` datetime(6) DEFAULT NULL,
  `Status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CancellationReason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL,
  `DeletedOn` datetime(6) DEFAULT NULL,
  `DeletedBy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`InvoiceId`),
  UNIQUE KEY `IX_Invoices_OrganizationId_InvoiceNumber` (`OrganizationId`,`InvoiceNumber`),
  KEY `IX_Invoices_CourseId` (`CourseId`),
  KEY `IX_Invoices_OrganizationId_IsDeleted` (`OrganizationId`,`IsDeleted`),
  KEY `IX_Invoices_StudentId` (`StudentId`),
  CONSTRAINT `FK_Invoices_Courses_CourseId` FOREIGN KEY (`CourseId`) REFERENCES `courses` (`CourseId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_Invoices_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_Invoices_Students_StudentId` FOREIGN KEY (`StudentId`) REFERENCES `students` (`StudentId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,1,'INV-KEN-261118-2HVWKA',15,2,'Karnataka - 530068',NULL,'INR','None',30000.00,0.00,30000.00,0.00,0.00,30000.00,30000.00,0.00,'2026-11-18 05:49:06.065727','2026-11-18 05:49:06.065727','2026-11-18 05:49:06.065727',NULL,'Paid','UPI payment (UTR 668835633718). Enrollment KEN-261118-2HVWKA.',NULL,0,NULL,NULL);
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leaverequestattachments`
--

DROP TABLE IF EXISTS `leaverequestattachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leaverequestattachments` (
  `LeaveRequestAttachmentId` int NOT NULL AUTO_INCREMENT,
  `LeaveRequestId` int NOT NULL,
  `OrganizationId` int NOT NULL,
  `UploadedByUserId` int NOT NULL,
  `OriginalFileName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ContentType` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SizeBytes` bigint NOT NULL,
  `Sha256` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `StoragePath` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UploadedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`LeaveRequestAttachmentId`),
  KEY `IX_LeaveRequestAttachments_LeaveRequestId` (`LeaveRequestId`),
  KEY `IX_LeaveRequestAttachments_OrganizationId_LeaveRequestId` (`OrganizationId`,`LeaveRequestId`),
  CONSTRAINT `FK_LeaveRequestAttachments_LeaveRequests_LeaveRequestId` FOREIGN KEY (`LeaveRequestId`) REFERENCES `leaverequests` (`LeaveRequestId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaverequestattachments`
--

LOCK TABLES `leaverequestattachments` WRITE;
/*!40000 ALTER TABLE `leaverequestattachments` DISABLE KEYS */;
INSERT INTO `leaverequestattachments` VALUES (1,3,1,1,'WhatsApp Image 2026-11-18 at 9.26.54 AM.jpeg','image/jpeg',88035,'0a18fb1fd64131dd47b77dd88fc601717171f68aeaa3e5e9c77c9b00e6fab20f','leaveattachments/1/952d1f700fc946328fecb06ef580610b.jpg','2026-11-18 07:21:11.039649');
/*!40000 ALTER TABLE `leaverequestattachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leaverequests`
--

DROP TABLE IF EXISTS `leaverequests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leaverequests` (
  `LeaveRequestId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `EmployeeId` int NOT NULL,
  `LeaveType` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `Reason` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `Status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ApprovedBy` int DEFAULT NULL,
  `ApprovedOn` datetime(6) DEFAULT NULL,
  `AppliedOn` datetime(6) NOT NULL,
  `RejectionReason` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `IsDeleted` tinyint(1) NOT NULL,
  `DeletedOn` datetime(6) DEFAULT NULL,
  `DeletedBy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`LeaveRequestId`),
  KEY `IX_LeaveRequests_EmployeeId` (`EmployeeId`),
  KEY `IX_LeaveRequests_OrganizationId_EmployeeId_StartDate_EndDate` (`OrganizationId`,`EmployeeId`,`StartDate`,`EndDate`),
  CONSTRAINT `FK_LeaveRequests_Employees_EmployeeId` FOREIGN KEY (`EmployeeId`) REFERENCES `employees` (`EmployeeId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_LeaveRequests_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaverequests`
--

LOCK TABLES `leaverequests` WRITE;
/*!40000 ALTER TABLE `leaverequests` DISABLE KEYS */;
INSERT INTO `leaverequests` VALUES (1,1,1,'Sick','2026-11-03','2026-11-03','HEALTH','Pending',NULL,NULL,'2026-11-02 12:21:02.766780',NULL,0,NULL,NULL),(2,1,1,'Casual','2026-11-13','2026-11-13','trdg','Approved',12,'2026-11-13 04:16:51.963510','2026-11-13 04:16:31.895379',NULL,0,NULL,NULL),(3,1,1,'Sick','2026-11-18','2026-11-19','dgj,hngf','Approved',12,'2026-11-18 08:26:33.487620','2026-11-18 07:21:10.181604',NULL,0,NULL,NULL);
/*!40000 ALTER TABLE `leaverequests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `liveclasses`
--

DROP TABLE IF EXISTS `liveclasses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `liveclasses` (
  `LiveClassId` int NOT NULL AUTO_INCREMENT,
  `ClassTitle` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CourseId` int NOT NULL,
  `BatchId` int NOT NULL,
  `MentorId` int NOT NULL,
  `ScheduledDate` datetime(6) NOT NULL,
  `StartTime` time(6) NOT NULL,
  `EndTime` time(6) NOT NULL,
  `MeetingPlatform` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `MeetingLink` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `HostLink` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MeetingId` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MeetingPassword` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RecordingEnabled` tinyint(1) NOT NULL,
  `RecordingUrl` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RecordingPath` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RecordingName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `RecordingUploadedAt` datetime(6) DEFAULT NULL,
  `ModulePdfPath` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ModulePdfName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `ReminderSent` tinyint(1) NOT NULL,
  `ModuleId` int NOT NULL,
  PRIMARY KEY (`LiveClassId`),
  KEY `IX_LiveClasses_BatchId` (`BatchId`),
  KEY `IX_LiveClasses_CourseId` (`CourseId`),
  KEY `IX_LiveClasses_MentorId` (`MentorId`),
  KEY `IX_LiveClasses_ModuleId` (`ModuleId`),
  CONSTRAINT `FK_LiveClasses_Batches_BatchId` FOREIGN KEY (`BatchId`) REFERENCES `batches` (`BatchId`) ON DELETE CASCADE,
  CONSTRAINT `FK_LiveClasses_CourseModules_ModuleId` FOREIGN KEY (`ModuleId`) REFERENCES `coursemodules` (`ModuleId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_LiveClasses_Courses_CourseId` FOREIGN KEY (`CourseId`) REFERENCES `courses` (`CourseId`) ON DELETE CASCADE,
  CONSTRAINT `FK_LiveClasses_Mentors_MentorId` FOREIGN KEY (`MentorId`) REFERENCES `mentors` (`MentorId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `liveclasses`
--

LOCK TABLES `liveclasses` WRITE;
/*!40000 ALTER TABLE `liveclasses` DISABLE KEYS */;
/*!40000 ALTER TABLE `liveclasses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meetingevents`
--

DROP TABLE IF EXISTS `meetingevents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meetingevents` (
  `MeetingEventId` int NOT NULL AUTO_INCREMENT,
  `LiveClassId` int NOT NULL,
  `StudentId` int DEFAULT NULL,
  `EventId` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MeetingId` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ParticipantId` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ParticipantEmail` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ParticipantName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `EventType` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `EventTime` datetime(6) NOT NULL,
  `IsProcessed` tinyint(1) NOT NULL,
  PRIMARY KEY (`MeetingEventId`),
  UNIQUE KEY `IX_MeetingEvents_EventId` (`EventId`),
  KEY `IX_MeetingEvents_IsProcessed` (`IsProcessed`),
  KEY `IX_MeetingEvents_LiveClassId` (`LiveClassId`),
  KEY `IX_MeetingEvents_LiveClassId_IsProcessed` (`LiveClassId`,`IsProcessed`),
  KEY `IX_MeetingEvents_MeetingId` (`MeetingId`),
  CONSTRAINT `FK_MeetingEvents_LiveClasses_LiveClassId` FOREIGN KEY (`LiveClassId`) REFERENCES `liveclasses` (`LiveClassId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meetingevents`
--

LOCK TABLES `meetingevents` WRITE;
/*!40000 ALTER TABLE `meetingevents` DISABLE KEYS */;
/*!40000 ALTER TABLE `meetingevents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meetingplatforms`
--

DROP TABLE IF EXISTS `meetingplatforms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meetingplatforms` (
  `MeetingPlatformId` int NOT NULL AUTO_INCREMENT,
  `PlatformName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`MeetingPlatformId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meetingplatforms`
--

LOCK TABLES `meetingplatforms` WRITE;
/*!40000 ALTER TABLE `meetingplatforms` DISABLE KEYS */;
/*!40000 ALTER TABLE `meetingplatforms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mentors`
--

DROP TABLE IF EXISTS `mentors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mentors` (
  `MentorId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `EmployeeId` int NOT NULL,
  `FirstName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `LastName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Phone` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PasswordHash` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Status` tinyint(1) NOT NULL,
  `CreatedDate` datetime(6) NOT NULL,
  `IsDeleted` tinyint(1) NOT NULL,
  `DeletedOn` datetime(6) DEFAULT NULL,
  `DeletedBy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`MentorId`),
  KEY `IX_Mentors_EmployeeId` (`EmployeeId`),
  KEY `IX_Mentors_OrganizationId_Email` (`OrganizationId`,`Email`),
  CONSTRAINT `FK_Mentors_Employees_EmployeeId` FOREIGN KEY (`EmployeeId`) REFERENCES `employees` (`EmployeeId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_Mentors_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mentors`
--

LOCK TABLES `mentors` WRITE;
/*!40000 ALTER TABLE `mentors` DISABLE KEYS */;
INSERT INTO `mentors` VALUES (1,1,1,'MAHESH','MAHI','maherishi31@gmail.com','8499488477','$2a$11$lsG0vvDynrRRj99QFafYceJx48tuwy2udNkrCcxDhBtXKIozDdiWW',1,'2026-11-02 06:45:42.225923',0,NULL,NULL),(2,1,2,'MANI TEJA','PULLIIIIII','maniteja123@gmail.com','7577638938','$2a$11$hRfmup8Yq7/F2.kgYPQogeoR9wA1C2P5.GJJfDo/QwmlKRWXGIkgC',1,'2026-11-02 06:47:05.684972',0,NULL,NULL),(3,1,3,'nani','hari','nani12@gmail.com','6474738829','$2a$11$em0r044pxZsTDXv8IcObOO1gg3qRq58EYkfJWaXhyg0lQdcVckRyq',1,'2026-11-02 06:48:23.030107',0,NULL,NULL),(4,1,4,'narendra','krishna','narendrakrishna@gmail.com','8974774747','$2a$11$qiRbtQCbRg6H7dlwEB.4le4yh26H4rJrOgOK84dGpbvX/Xx4nOMf.',1,'2026-11-02 06:49:06.335533',0,NULL,NULL),(5,1,6,'Luna','Grace','lunagrace123@gmail.com','9989225788','$2a$11$/myt2hlsG53DTddmcgwth.D5.2DmJUocrVDyVKR9ORTo8dfdSme4i',1,'2026-11-06 05:40:51.192168',0,NULL,NULL),(6,1,7,'Hima','Gandikota','himagandikota123@gmail.com','9879564731','$2a$11$bYwHSMhRJnTMTESQh/ZgduAnppJOdfSj.CIdNhVE6rJbojsC0mIDO',1,'2026-11-06 10:10:28.889918',0,NULL,NULL),(7,1,9,'Mani','Teja','mani@gmail.com','9871442345','$2a$11$ASHiIQ88ZA/ntclYyhEIBeM5F14WpVm9OURYKUCjftNEQ2PtTF1te',1,'2026-11-18 07:25:01.184551',0,NULL,NULL),(8,1,10,'kadiveti','narenhshd','kadivetinarendra214@gmail.com','7281772187','$2a$11$UvCccAEozz4HLzvzUo62C.9p9hJGnhH9QJ9BrI.g/zLlccwOfGqfC',1,'2026-11-18 14:57:13.957976',0,NULL,NULL);
/*!40000 ALTER TABLE `mentors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `NotificationId` int NOT NULL AUTO_INCREMENT,
  `StudentId` int DEFAULT NULL,
  `MentorId` int DEFAULT NULL,
  `OrganizationId` int DEFAULT NULL,
  `Title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Message` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `NotificationType` int NOT NULL,
  `ReferenceId` int NOT NULL,
  `ReferenceType` int NOT NULL,
  `IsRead` tinyint(1) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `ReadAt` datetime(6) DEFAULT NULL,
  `CreatedByMentorId` int DEFAULT NULL,
  `EmployeeId` int DEFAULT NULL,
  PRIMARY KEY (`NotificationId`),
  KEY `IX_Notifications_CreatedByMentorId` (`CreatedByMentorId`),
  KEY `IX_Notifications_EmployeeId` (`EmployeeId`),
  KEY `IX_Notifications_MentorId` (`MentorId`),
  KEY `IX_Notifications_OrganizationId_CreatedAt` (`OrganizationId`,`CreatedAt`),
  KEY `IX_Notifications_OrganizationId_IsRead` (`OrganizationId`,`IsRead`),
  KEY `IX_Notifications_StudentId` (`StudentId`),
  CONSTRAINT `FK_Notifications_Employees_EmployeeId` FOREIGN KEY (`EmployeeId`) REFERENCES `employees` (`EmployeeId`),
  CONSTRAINT `FK_Notifications_Mentors_CreatedByMentorId` FOREIGN KEY (`CreatedByMentorId`) REFERENCES `mentors` (`MentorId`),
  CONSTRAINT `FK_Notifications_Mentors_MentorId` FOREIGN KEY (`MentorId`) REFERENCES `mentors` (`MentorId`),
  CONSTRAINT `FK_Notifications_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE CASCADE,
  CONSTRAINT `FK_Notifications_Students_StudentId` FOREIGN KEY (`StudentId`) REFERENCES `students` (`StudentId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,NULL,NULL,1,'New Course Created','Course \'React.js\' has been created.',23,1,3,0,'2026-11-02 06:31:39.822416',NULL,NULL,NULL),(2,NULL,NULL,1,'New Course Created','Course \'Python\' has been created.',23,2,3,0,'2026-11-02 06:32:42.206775',NULL,NULL,NULL),(3,NULL,NULL,1,'New Course Created','Course \'Java Full Stack\' has been created.',23,3,3,0,'2026-11-02 06:33:25.156913',NULL,NULL,NULL),(4,NULL,NULL,1,'New Course Created','Course \'RPA\' has been created.',23,4,3,0,'2026-11-02 06:34:22.284373',NULL,NULL,NULL),(5,NULL,NULL,1,'New Course Created','Course \'Cybersecurity\' has been created.',23,5,3,0,'2026-11-02 06:35:08.585056',NULL,NULL,NULL),(6,NULL,NULL,1,'New Mentor Created','MAHESH MAHI has been added as a mentor.',12,1,6,0,'2026-11-02 06:45:47.672956',NULL,NULL,NULL),(7,NULL,NULL,1,'New Mentor Created','MANI TEJA PULLIIIIII has been added as a mentor.',12,2,6,0,'2026-11-02 06:47:10.303403',NULL,NULL,NULL),(8,NULL,NULL,1,'New Mentor Created','nani hari has been added as a mentor.',12,3,6,0,'2026-11-02 06:48:26.664432',NULL,NULL,NULL),(9,NULL,NULL,1,'New Mentor Created','narendra krishna has been added as a mentor.',12,4,6,0,'2026-11-02 06:49:09.589680',NULL,NULL,NULL),(10,NULL,NULL,1,'New Batch Created','Batch \'Java Full Stack 1\' has been created.',25,1,4,0,'2026-11-02 06:50:38.777395',NULL,NULL,NULL),(11,NULL,NULL,1,'New Batch Created','Batch \'Cybersecurity 1\' has been created.',25,2,4,0,'2026-11-02 06:51:11.177291',NULL,NULL,NULL),(12,NULL,NULL,1,'New Batch Created','Batch \'React.js 1\' has been created.',25,3,4,0,'2026-11-02 06:51:44.671394',NULL,NULL,NULL),(13,NULL,NULL,1,'New Batch Created','Batch \'RPA 1\' has been created.',25,4,4,0,'2026-11-02 06:52:13.838826',NULL,NULL,NULL),(14,NULL,NULL,1,'Student Enrollment Approved','Test Student has been approved for enrollment.',9,1,5,0,'2026-11-02 06:52:49.628654',NULL,NULL,NULL),(15,NULL,NULL,1,'Student Enrollment Approved','Test MAHI has been approved for enrollment.',9,2,5,0,'2026-11-02 08:58:27.020746',NULL,NULL,NULL),(16,NULL,NULL,1,'New Course Created','Course \'mvc\' has been created.',23,6,3,0,'2026-11-02 09:43:06.390590',NULL,NULL,NULL),(17,NULL,NULL,1,'New Course Created','Course \'Devops\' has been created.',23,7,3,0,'2026-11-02 10:04:05.150420',NULL,NULL,NULL),(18,NULL,NULL,1,'New Course Created','Course \'MVC\' has been created.',23,8,3,0,'2026-11-02 10:06:30.674301',NULL,NULL,NULL),(19,NULL,NULL,1,'Batch Updated','Batch \'Java Full Stack 1\' has been updated.',26,1,4,0,'2026-11-02 10:08:16.271947',NULL,NULL,NULL),(20,NULL,NULL,1,'Mentor Assigned to Batch','A mentor has been assigned to batch \'Java Full Stack 1\'.',13,1,4,0,'2026-11-02 10:08:16.304352',NULL,NULL,NULL),(21,NULL,NULL,1,'Batch Updated','Batch \'React.js 1\' has been updated.',26,3,4,0,'2026-11-02 10:12:28.564892',NULL,NULL,NULL),(22,NULL,NULL,1,'Mentor Assigned to Batch','A mentor has been assigned to batch \'React.js 1\'.',13,3,4,0,'2026-11-02 10:12:28.599186',NULL,NULL,NULL),(23,NULL,NULL,1,'Batch Updated','Batch \'RPA 11\' has been updated.',26,4,4,0,'2026-11-02 10:13:45.033682',NULL,NULL,NULL),(24,NULL,NULL,1,'Student Enrollment Approved','maheshhhhh DHONI has been approved for enrollment.',9,3,5,0,'2026-11-02 11:08:35.025628',NULL,NULL,NULL),(25,NULL,NULL,1,'Student Enrollment Approved','srinivas viajy has been approved for enrollment.',9,4,5,0,'2026-11-02 11:08:53.131193',NULL,NULL,NULL),(26,NULL,NULL,1,'Employee Permissions Changed','Permissions for employee ID 1 have been updated.',38,1,9,0,'2026-11-02 11:46:00.438700',NULL,NULL,NULL),(27,NULL,NULL,1,'New Leave Request','MAHESH MAHI has submitted a Sick leave request from 03-11-2026 to 03-11-2026.',19,1,11,0,'2026-11-02 12:21:03.111157',NULL,NULL,NULL),(28,NULL,NULL,1,'Student Enrollment Approved','Test Student has been approved for enrollment.',9,5,5,0,'2026-11-03 10:11:55.651337',NULL,NULL,NULL),(29,NULL,NULL,1,'Student Enrollment Approved','Rahul Kumar has been approved for enrollment.',9,6,5,0,'2026-11-03 11:51:52.529416',NULL,NULL,NULL),(30,NULL,NULL,1,'Student Enrollment Approved','vishal babu has been approved for enrollment.',9,7,5,0,'2026-11-03 12:05:15.253964',NULL,NULL,NULL),(31,NULL,NULL,1,'New HR User Created','poorna Bhai has been added as an HR user.',18,5,10,0,'2026-11-05 12:13:35.454035',NULL,NULL,NULL),(32,NULL,NULL,1,'Employee Permissions Changed','Permissions for employee ID 5 have been updated.',38,5,9,0,'2026-11-05 12:14:53.308316',NULL,NULL,NULL),(33,NULL,NULL,1,'New Course Created','Course \'ML\' has been created.',23,9,3,0,'2026-11-06 05:37:14.052214',NULL,NULL,NULL),(34,NULL,NULL,1,'New Mentor Created','Luna Grace has been added as a mentor.',12,6,6,0,'2026-11-06 05:40:57.177873',NULL,NULL,NULL),(35,NULL,NULL,1,'New Mentor Created','Hima Gandikota has been added as a mentor.',12,7,6,0,'2026-11-06 10:10:35.168905',NULL,NULL,NULL),(36,NULL,NULL,1,'New Batch Created','Batch \'ML 1\' has been created.',25,5,4,0,'2026-11-06 10:23:45.960769',NULL,NULL,NULL),(37,NULL,NULL,1,'Student Enrollment Approved','Luna John has been approved for enrollment.',9,8,5,0,'2026-11-06 10:24:24.320517',NULL,NULL,NULL),(38,NULL,NULL,1,'Student Enrollment Approved','Durvan Dontala has been approved for enrollment.',9,9,5,0,'2026-11-06 10:28:01.553823',NULL,NULL,NULL),(39,NULL,NULL,1,'New HR User Created','Bhuvan Dontala has been added as an HR user.',18,8,10,0,'2026-11-06 10:32:24.908964',NULL,NULL,NULL),(40,NULL,NULL,1,'Employee Permissions Changed','Permissions for employee ID 7 have been updated.',38,7,9,0,'2026-11-06 10:34:56.530871',NULL,NULL,NULL),(41,NULL,NULL,1,'Employee Permissions Changed','Permissions for employee ID 8 have been updated.',38,8,9,0,'2026-11-06 10:36:05.939205',NULL,NULL,NULL),(42,NULL,NULL,1,'Student Assigned to Batch','Venkata Vedansh has been assigned to batch \'Cybersecurity 1\'.',11,10,5,0,'2026-11-09 05:30:40.581026',NULL,NULL,NULL),(43,NULL,NULL,1,'Student Enrollment Approved','Venkata Vedansh has been approved for enrollment.',9,10,5,0,'2026-11-09 05:37:22.624877',NULL,NULL,NULL),(44,NULL,NULL,1,'Student Assigned to Batch','Test MAHI has been assigned to batch \'Cybersecurity 1\'.',11,2,5,0,'2026-11-09 05:43:13.155774',NULL,NULL,NULL),(45,NULL,NULL,1,'Employee Deactivated','Hima Gandikota has been deactivated.',16,7,9,0,'2026-11-09 06:13:41.448418',NULL,NULL,NULL),(46,NULL,NULL,1,'Batch Updated','Batch \'Cybersecurity 1\' has been updated.',26,2,4,0,'2026-11-09 06:18:36.796071',NULL,NULL,NULL),(47,NULL,NULL,1,'Mentor Assigned to Batch','A mentor has been assigned to batch \'Cybersecurity 1\'.',13,2,4,0,'2026-11-09 06:18:36.822498',NULL,NULL,NULL),(48,NULL,NULL,1,'Batch Updated','Batch \'Cybersecurity 1\' has been updated.',26,2,4,0,'2026-11-09 06:19:15.800125',NULL,NULL,NULL),(49,NULL,NULL,1,'Batch Updated','Batch \'Java Full Stack 1\' has been updated.',26,1,4,0,'2026-11-09 06:19:42.269822',NULL,NULL,NULL),(50,NULL,NULL,1,'Mentor Assigned to Batch','A mentor has been assigned to batch \'Java Full Stack 1\'.',13,1,4,0,'2026-11-09 06:19:42.297482',NULL,NULL,NULL),(51,NULL,NULL,1,'Course Updated','Course \'Cybersecurit\' has been updated.',24,5,3,0,'2026-11-09 06:26:59.673480',NULL,NULL,NULL),(52,NULL,NULL,1,'Course Updated','Course \'Cybersecurity\' has been updated.',24,5,3,0,'2026-11-09 06:27:09.472063',NULL,NULL,NULL),(53,NULL,NULL,1,'Course Updated','Course \'mjjjjjjjjjc\' has been updated.',24,7,3,0,'2026-11-09 06:27:44.376902',NULL,NULL,NULL),(54,NULL,NULL,1,'Course Updated','Course \'Devops\' has been updated.',24,7,3,0,'2026-11-09 06:27:56.005296',NULL,NULL,NULL),(55,NULL,NULL,1,'Student Assigned to Batch','vishal babu has been assigned to batch \'Java Full Stack 1\'.',11,7,5,0,'2026-11-11 05:54:38.319132',NULL,NULL,NULL),(56,NULL,NULL,1,'Student Assigned to Batch','Mukesh yedida has been assigned to batch \'React.js 1\'.',11,11,5,0,'2026-11-11 06:04:48.186632',NULL,NULL,NULL),(57,NULL,NULL,1,'Student Enrollment Approved','Mukesh yedida has been approved for enrollment.',9,11,5,0,'2026-11-11 06:05:20.164032',NULL,NULL,NULL),(58,NULL,NULL,1,'New Assessment Created','Assessment \'Test\' has been created for batch \'React.js 1\'.',28,1,2,0,'2026-11-11 06:38:07.272803',NULL,NULL,NULL),(59,NULL,NULL,1,'Student Enrollment Approved','Narendra Kumar has been approved for enrollment.',9,12,5,0,'2026-11-11 06:42:55.377336',NULL,NULL,NULL),(60,NULL,NULL,1,'Employee Profile Updated','MAHESHhhhhhhhhhhhhhh MAHI\'s employee profile has been updated.',15,1,9,0,'2026-11-11 06:45:44.853626',NULL,NULL,NULL),(61,NULL,NULL,1,'Employee Profile Updated','MAHESH MAHI\'s employee profile has been updated.',15,1,9,0,'2026-11-11 06:48:28.541092',NULL,NULL,NULL),(62,NULL,NULL,1,'New Assessment Created','Assessment \'Test 2\' has been created for batch \'React.js 1\'.',28,2,2,0,'2026-11-11 06:50:45.706845',NULL,NULL,NULL),(63,NULL,NULL,1,'Employee Profile Updated','MAHESH Bhaiiiiiiiiiiiiiii MAHI\'s employee profile has been updated.',15,1,9,0,'2026-11-11 07:12:56.112690',NULL,NULL,NULL),(64,NULL,NULL,1,'Employee Profile Updated','MAHESH MAHI\'s employee profile has been updated.',15,1,9,0,'2026-11-11 07:13:28.582878',NULL,NULL,NULL),(65,NULL,NULL,1,'Student Enrollment Approved','saiiiii rapur has been approved for enrollment.',9,13,5,0,'2026-11-11 09:38:00.602819',NULL,NULL,NULL),(66,NULL,1,NULL,'New Chat Message','Narendra Kumar: Hi',41,1,17,1,'2026-11-12 10:42:39.494905','2026-11-13 04:21:32.604772',NULL,NULL),(67,NULL,NULL,1,'New Leave Request','MAHESH MAHI has submitted a Casual leave request from 13-11-2026 to 13-11-2026.',19,2,11,0,'2026-11-13 04:16:32.310407',NULL,NULL,NULL),(68,NULL,NULL,1,'Leave Request Approved','MAHESH MAHI\'s leave request has been approved.',20,2,11,0,'2026-11-13 04:16:52.005333',NULL,NULL,NULL),(69,NULL,NULL,NULL,'Leave Request Approved','Your leave request has been approved.',20,2,11,0,'2026-11-13 04:16:52.040258',NULL,NULL,1),(70,NULL,NULL,1,'Student Assigned to Batch','Narendra Kumar has been assigned to batch \'Java Full Stack 1\'.',11,12,5,0,'2026-11-13 04:56:43.900020',NULL,NULL,NULL),(71,NULL,NULL,1,'Payment proof submitted','kadiveti Narendra submitted UPI payment proof for Python (KEN-261118-W2CLCB). Verify it against your bank statement.',31,3,13,0,'2026-11-18 04:03:20.875710',NULL,NULL,NULL),(72,NULL,NULL,1,'New Batch Created','Batch \'Python 1\' has been created.',25,6,4,0,'2026-11-18 04:59:41.835652',NULL,NULL,NULL),(73,NULL,NULL,1,'Payment proof submitted','kadiveti Naren submitted UPI payment proof for Python (KEN-261118-2HVWKA). Verify it against your bank statement.',31,6,13,0,'2026-11-18 05:47:57.869765',NULL,NULL,NULL),(74,NULL,NULL,1,'New Leave Request','MAHESH MAHI has submitted a Sick leave request from 18-11-2026 to 19-11-2026.',19,3,11,0,'2026-11-18 07:21:10.586362',NULL,NULL,NULL),(75,NULL,NULL,1,'New Mentor Created','Mani Teja has been added as a mentor.',12,9,6,0,'2026-11-18 07:25:05.470007',NULL,NULL,NULL),(76,NULL,NULL,1,'Employee Created','Employee Mani Teja was created successfully.',14,9,9,0,'2026-11-18 07:25:05.485403',NULL,NULL,NULL),(77,NULL,NULL,1,'Leave Request Approved','MAHESH MAHI\'s leave request has been approved.',20,3,11,0,'2026-11-18 08:26:33.581396',NULL,NULL,NULL),(78,NULL,NULL,NULL,'Leave Request Approved','Your leave request has been approved.',20,3,11,0,'2026-11-18 08:26:33.637100',NULL,NULL,1),(79,NULL,NULL,1,'New Course Created','Course \'typescript\' has been created.',23,10,3,0,'2026-11-18 08:49:55.253340',NULL,NULL,NULL),(80,NULL,NULL,1,'Course Updated','Course \'typescript\' has been updated.',24,10,3,0,'2026-11-18 08:55:47.720758',NULL,NULL,NULL),(81,NULL,NULL,1,'Course Updated','Course \'Cybersecurity\' has been updated.',24,5,3,0,'2026-11-18 09:13:27.236966',NULL,NULL,NULL),(82,NULL,NULL,1,'New Mentor Created','kadiveti narenhshd has been added as a mentor.',12,10,6,0,'2026-11-18 14:57:26.572680',NULL,NULL,NULL),(83,NULL,NULL,1,'Employee Deactivated','Luna Grace has been deactivated.',16,6,9,0,'2026-11-18 15:14:07.708930',NULL,NULL,NULL);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `Amount` decimal(18,2) NOT NULL,
  `Currency` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CouponCode` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `Discount` decimal(18,2) NOT NULL,
  `FinalAmount` decimal(18,2) NOT NULL,
  `CreatedOn` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizationpaymentsettings`
--

DROP TABLE IF EXISTS `organizationpaymentsettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizationpaymentsettings` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `UpiId` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PayeeName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `QrCodePath` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_OrganizationPaymentSettings_OrganizationId` (`OrganizationId`),
  CONSTRAINT `FK_OrganizationPaymentSettings_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizationpaymentsettings`
--

LOCK TABLES `organizationpaymentsettings` WRITE;
/*!40000 ALTER TABLE `organizationpaymentsettings` DISABLE KEYS */;
INSERT INTO `organizationpaymentsettings` VALUES (1,1,'6300044926@ptsbi','kini','UpiQrCodes/1/da58b8d671bc44eb801afa998aa0d828.jpg',1,'2026-11-18 03:58:10.380112','2026-11-18 09:49:01.587432');
/*!40000 ALTER TABLE `organizationpaymentsettings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations` (
  `OrganizationId` int NOT NULL AUTO_INCREMENT,
  `OrganizationName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Phone` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Industry` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Country` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Website` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PasswordHash` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `GoogleSubjectId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CreatedDate` datetime(6) NOT NULL,
  `LogoUrl` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`OrganizationId`),
  UNIQUE KEY `IX_Organizations_GoogleSubjectId` (`GoogleSubjectId`),
  KEY `IX_Organizations_Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES (1,'KINI','chinnilahari1225@gmail.com','8938848847','Education','India','https://kiniedx.com/','$2a$11$CLAvfCq8vV2vfiJqSO1bEeiZNX7UCR6yNCtm2j9ceK6QNxRnQO5QG',NULL,'2026-11-02 05:41:02.760038','/uploads/organization-logos/1_663026e360f247729ca9cd960da03b64.jpg');
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otpverifications`
--

DROP TABLE IF EXISTS `otpverifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otpverifications` (
  `OtpVerificationId` int NOT NULL AUTO_INCREMENT,
  `Identifier` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Otp` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `OtpType` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IsVerified` tinyint(1) NOT NULL,
  `IsUsed` tinyint(1) NOT NULL,
  `ExpiryTime` datetime(6) NOT NULL,
  `CreatedDate` datetime(6) NOT NULL,
  PRIMARY KEY (`OtpVerificationId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otpverifications`
--

LOCK TABLES `otpverifications` WRITE;
/*!40000 ALTER TABLE `otpverifications` DISABLE KEYS */;
INSERT INTO `otpverifications` VALUES (1,'kadivetinarendra2104@gmail.com','668462','email',1,0,'2026-11-18 06:30:58.874584','2026-11-18 06:25:59.028917');
/*!40000 ALTER TABLE `otpverifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `passwordsetuptokens`
--

DROP TABLE IF EXISTS `passwordsetuptokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passwordsetuptokens` (
  `PasswordSetupTokenId` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `CourseEnrollmentId` int DEFAULT NULL,
  `TokenHash` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Purpose` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ExpiresAt` datetime(6) NOT NULL,
  `UsedAt` datetime(6) DEFAULT NULL,
  `RevokedAt` datetime(6) DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`PasswordSetupTokenId`),
  UNIQUE KEY `IX_PasswordSetupTokens_TokenHash` (`TokenHash`),
  KEY `IX_PasswordSetupTokens_CourseEnrollmentId` (`CourseEnrollmentId`),
  KEY `IX_PasswordSetupTokens_UserId_UsedAt` (`UserId`,`UsedAt`),
  CONSTRAINT `FK_PasswordSetupTokens_CourseEnrollments_CourseEnrollmentId` FOREIGN KEY (`CourseEnrollmentId`) REFERENCES `courseenrollments` (`Id`) ON DELETE SET NULL,
  CONSTRAINT `FK_PasswordSetupTokens_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`UserId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passwordsetuptokens`
--

LOCK TABLES `passwordsetuptokens` WRITE;
/*!40000 ALTER TABLE `passwordsetuptokens` DISABLE KEYS */;
INSERT INTO `passwordsetuptokens` VALUES (1,22,3,'7873fafc5abebda408d45c8d46c296b822c8a287802a21097d1100336457de56','InitialSetup','2026-11-20 05:00:10.190829','2026-11-18 05:05:56.032999',NULL,'2026-11-18 05:00:10.190829'),(2,23,6,'fa46398f52625be298dd37f306c0644ab43f2ab016e92518cef42450f4de4a11','InitialSetup','2026-11-20 05:49:54.438338','2026-11-18 05:50:33.711573',NULL,'2026-11-18 05:49:54.438338'),(3,23,NULL,'b2e9b803cf610027cd394a0c6b5b86cf35ccb0217e40449a7391ad801d846f4f','PasswordReset','2026-11-18 06:36:32.249495','2026-11-18 06:27:17.590526',NULL,'2026-11-18 06:26:32.249495');
/*!40000 ALTER TABLE `passwordsetuptokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `OrderId` int NOT NULL,
  `PaymentId` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Amount` decimal(18,2) NOT NULL,
  `PaidOn` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `PermissionId` int NOT NULL AUTO_INCREMENT,
  `Module` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IsActive` tinyint(1) NOT NULL,
  PRIMARY KEY (`PermissionId`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'Dashboard',1),(2,'Employees',1),(3,'Courses',1),(4,'Batches',1),(5,'Attendance',1),(6,'Assessments',1),(7,'Reports',1),(8,'LiveClass',1),(9,'EmployeeProfile',1),(10,'Students',1),(11,'Leave Management',1),(12,'Performance',1),(13,'Resources',1),(14,'Announcements',1),(15,'Settings',1),(17,'Calendar',1),(18,'OrganizationPaymentSettings',1),(19,'Payment Verification',1),(20,'Enrollment Approval',1);
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Email` varchar(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `MobileNumber` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Qualification` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Program` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CreatedDate` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_registrations_Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrations`
--

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rolecompetencies`
--

DROP TABLE IF EXISTS `rolecompetencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rolecompetencies` (
  `RoleCompetencyId` int NOT NULL AUTO_INCREMENT,
  `RoleId` int NOT NULL,
  `CompetencyId` int NOT NULL,
  `RequiredLevel` int NOT NULL,
  PRIMARY KEY (`RoleCompetencyId`),
  KEY `IX_RoleCompetencies_CompetencyId` (`CompetencyId`),
  KEY `IX_RoleCompetencies_RoleId` (`RoleId`),
  CONSTRAINT `FK_RoleCompetencies_Competencies_CompetencyId` FOREIGN KEY (`CompetencyId`) REFERENCES `competencies` (`CompetencyId`) ON DELETE CASCADE,
  CONSTRAINT `FK_RoleCompetencies_Roles_RoleId` FOREIGN KEY (`RoleId`) REFERENCES `roles` (`RoleId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rolecompetencies`
--

LOCK TABLES `rolecompetencies` WRITE;
/*!40000 ALTER TABLE `rolecompetencies` DISABLE KEYS */;
/*!40000 ALTER TABLE `rolecompetencies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rolepermissions`
--

DROP TABLE IF EXISTS `rolepermissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rolepermissions` (
  `RolePermissionId` int NOT NULL AUTO_INCREMENT,
  `Role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `OrganizationId` int DEFAULT NULL,
  `PermissionId` int NOT NULL,
  `CanView` tinyint(1) NOT NULL,
  `CanAdd` tinyint(1) NOT NULL,
  `CanEdit` tinyint(1) NOT NULL,
  `CanDelete` tinyint(1) NOT NULL,
  `CanAccess` tinyint(1) NOT NULL,
  PRIMARY KEY (`RolePermissionId`),
  UNIQUE KEY `IX_RolePermissions_OrganizationId_Role_PermissionId` (`OrganizationId`,`Role`,`PermissionId`),
  KEY `IX_RolePermissions_PermissionId` (`PermissionId`),
  CONSTRAINT `FK_RolePermissions_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE CASCADE,
  CONSTRAINT `FK_RolePermissions_Permissions_PermissionId` FOREIGN KEY (`PermissionId`) REFERENCES `permissions` (`PermissionId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rolepermissions`
--

LOCK TABLES `rolepermissions` WRITE;
/*!40000 ALTER TABLE `rolepermissions` DISABLE KEYS */;
INSERT INTO `rolepermissions` VALUES (1,'SuperAdmin',NULL,1,1,1,1,1,1),(2,'SuperAdmin',NULL,2,1,1,1,1,1),(3,'SuperAdmin',NULL,3,1,1,1,1,1),(4,'SuperAdmin',NULL,4,1,1,1,1,1),(5,'SuperAdmin',NULL,5,1,1,1,1,1),(6,'SuperAdmin',NULL,6,1,1,1,1,1),(7,'SuperAdmin',NULL,7,1,1,1,1,1),(8,'HR',NULL,1,1,0,0,0,1),(9,'HR',NULL,2,1,1,1,0,1),(10,'HR',NULL,3,1,1,1,0,1),(11,'HR',NULL,4,1,1,1,0,1),(12,'HR',NULL,5,1,0,1,0,1),(13,'HR',NULL,6,1,0,0,0,1),(14,'HR',NULL,7,1,0,0,0,1),(15,'HR',NULL,11,1,1,1,0,1),(22,'Mentor',NULL,1,1,0,0,0,1),(23,'Mentor',NULL,2,0,0,0,0,0),(24,'Mentor',NULL,3,1,0,1,0,1),(25,'Mentor',NULL,4,1,0,1,0,1),(26,'Mentor',NULL,5,1,1,1,0,1),(27,'Mentor',NULL,6,1,1,1,0,1),(28,'Mentor',NULL,7,1,0,0,0,1),(29,'Employee',NULL,1,1,0,0,0,1),(30,'Employee',NULL,2,0,0,0,0,0),(31,'Employee',NULL,3,1,0,0,0,1),(32,'Employee',NULL,4,1,0,0,0,1),(33,'Employee',NULL,5,1,0,0,0,1),(34,'Employee',NULL,6,1,0,0,0,1),(35,'Employee',NULL,7,0,0,0,0,0),(36,'Organization',NULL,1,1,0,0,0,1),(37,'Organization',NULL,2,1,1,1,0,1),(38,'Organization',NULL,3,1,1,1,0,1),(39,'Organization',NULL,4,1,1,1,0,1),(40,'Organization',NULL,5,1,0,0,0,1),(41,'Organization',NULL,6,1,0,0,0,1),(42,'Organization',NULL,7,1,0,0,0,1),(43,'Student',NULL,1,1,0,0,0,1),(44,'Student',NULL,2,0,0,0,0,0),(45,'Student',NULL,3,1,0,0,0,1),(46,'Student',NULL,4,1,0,0,0,1),(47,'Student',NULL,5,1,0,0,0,1),(48,'Student',NULL,6,1,0,0,0,1),(49,'Student',NULL,7,0,0,0,0,0),(57,'SuperAdmin',NULL,8,1,1,1,1,1),(58,'SuperAdmin',NULL,9,1,1,1,1,1),(59,'HR',NULL,8,1,1,1,0,1),(60,'HR',NULL,9,1,1,1,0,1),(61,'OperationAssociate',NULL,8,1,1,1,0,1),(62,'OperationAssociate',NULL,9,1,1,1,0,1),(63,'Mentor',NULL,8,1,1,1,0,1),(64,'Mentor',NULL,9,1,1,1,0,1),(65,'Employee',NULL,8,1,0,0,0,1),(66,'Employee',NULL,9,1,1,1,0,1),(67,'Organization',NULL,8,1,1,1,0,1),(68,'Organization',NULL,9,1,1,1,0,1),(69,'Student',NULL,8,1,0,0,0,1),(70,'Student',NULL,9,0,0,0,0,0),(71,'OperationAssociate',NULL,1,1,0,0,0,1),(72,'OperationAssociate',NULL,2,1,0,0,0,1),(73,'OperationAssociate',NULL,3,1,0,0,0,1),(74,'OperationAssociate',NULL,4,1,1,1,0,1),(75,'OperationAssociate',NULL,5,1,1,1,0,1),(76,'OperationAssociate',NULL,6,1,0,0,0,1),(77,'OperationAssociate',NULL,7,1,0,0,0,1),(89,'HRRecruiter',NULL,1,1,0,0,0,1),(90,'HRRecruiter',NULL,2,1,1,1,0,1),(91,'HRRecruiter',NULL,3,1,1,1,0,1),(92,'HRRecruiter',NULL,4,1,1,1,0,1),(93,'HRRecruiter',NULL,5,1,0,1,0,1),(94,'HRRecruiter',NULL,6,1,0,0,0,1),(95,'HRRecruiter',NULL,7,1,0,0,0,1),(96,'HRRecruiter',NULL,8,1,1,1,0,1),(97,'HRRecruiter',NULL,9,1,1,1,0,1),(98,'HRExecutive',NULL,1,1,0,0,0,1),(99,'HRExecutive',NULL,2,1,1,1,0,1),(100,'HRExecutive',NULL,3,1,1,1,0,1),(101,'HRExecutive',NULL,4,1,1,1,0,1),(102,'HRExecutive',NULL,5,1,0,1,0,1),(103,'HRExecutive',NULL,6,1,0,0,0,1),(104,'HRExecutive',NULL,7,1,0,0,0,1),(105,'HRExecutive',NULL,8,1,1,1,0,1),(106,'HRExecutive',NULL,9,1,1,1,0,1),(107,'SuperAdmin',NULL,10,1,1,1,1,1),(108,'Organization',NULL,10,1,1,1,1,1),(109,'HR',NULL,10,1,1,1,1,1),(110,'HRRecruiter',NULL,10,1,1,1,0,1),(111,'HRExecutive',NULL,10,1,1,1,0,1),(112,'OperationAssociate',NULL,10,1,1,1,0,1),(113,'Mentor',NULL,10,1,0,0,0,1),(114,'Employee',NULL,10,0,0,0,0,0),(115,'Student',NULL,10,0,0,0,0,0),(116,'HR',NULL,12,1,0,0,0,1),(117,'HR',NULL,13,1,1,1,1,1),(118,'HR',NULL,14,1,1,1,1,1),(119,'HR',NULL,15,1,0,1,0,1),(121,'HR',NULL,17,1,1,1,1,1),(122,'Organization',NULL,18,1,1,1,0,1),(123,'SuperAdmin',NULL,19,1,0,1,0,1),(124,'Organization',NULL,19,1,0,1,0,1),(125,'SuperAdmin',NULL,20,1,0,1,0,1),(126,'Organization',NULL,20,1,0,1,0,1);
/*!40000 ALTER TABLE `rolepermissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `RoleId` int NOT NULL AUTO_INCREMENT,
  `RoleName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`RoleId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skills`
--

DROP TABLE IF EXISTS `skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skills` (
  `SkillId` int NOT NULL AUTO_INCREMENT,
  `Name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Category` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Type` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`SkillId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skills`
--

LOCK TABLES `skills` WRITE;
/*!40000 ALTER TABLE `skills` DISABLE KEYS */;
/*!40000 ALTER TABLE `skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `studentassessmentanswers`
--

DROP TABLE IF EXISTS `studentassessmentanswers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `studentassessmentanswers` (
  `AnswerId` int NOT NULL AUTO_INCREMENT,
  `StudentAssessmentId` int NOT NULL,
  `QuestionId` int NOT NULL,
  `SelectedOptionId` int DEFAULT NULL,
  `AnswerText` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `IsCorrect` tinyint(1) NOT NULL,
  `MarksAwarded` decimal(18,2) NOT NULL,
  PRIMARY KEY (`AnswerId`),
  KEY `IX_StudentAssessmentAnswers_QuestionId` (`QuestionId`),
  KEY `IX_StudentAssessmentAnswers_StudentAssessmentId` (`StudentAssessmentId`),
  CONSTRAINT `FK_StudentAssessmentAnswers_AssessmentQuestions_QuestionId` FOREIGN KEY (`QuestionId`) REFERENCES `assessmentquestions` (`QuestionId`) ON DELETE CASCADE,
  CONSTRAINT `FK_StudentAssessmentAnswers_StudentAssessments_StudentAssessmen~` FOREIGN KEY (`StudentAssessmentId`) REFERENCES `studentassessments` (`StudentAssessmentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `studentassessmentanswers`
--

LOCK TABLES `studentassessmentanswers` WRITE;
/*!40000 ALTER TABLE `studentassessmentanswers` DISABLE KEYS */;
/*!40000 ALTER TABLE `studentassessmentanswers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `studentassessments`
--

DROP TABLE IF EXISTS `studentassessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `studentassessments` (
  `StudentAssessmentId` int NOT NULL AUTO_INCREMENT,
  `AssessmentId` int NOT NULL,
  `StudentId` int NOT NULL,
  `StartedAt` datetime(6) NOT NULL,
  `SubmittedAt` datetime(6) DEFAULT NULL,
  `Score` decimal(18,2) NOT NULL,
  `Percentage` decimal(5,2) NOT NULL,
  `Result` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`StudentAssessmentId`),
  KEY `IX_StudentAssessments_AssessmentId` (`AssessmentId`),
  KEY `IX_StudentAssessments_StudentId` (`StudentId`),
  CONSTRAINT `FK_StudentAssessments_Assessments_AssessmentId` FOREIGN KEY (`AssessmentId`) REFERENCES `assessments` (`AssessmentId`) ON DELETE CASCADE,
  CONSTRAINT `FK_StudentAssessments_Students_StudentId` FOREIGN KEY (`StudentId`) REFERENCES `students` (`StudentId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `studentassessments`
--

LOCK TABLES `studentassessments` WRITE;
/*!40000 ALTER TABLE `studentassessments` DISABLE KEYS */;
/*!40000 ALTER TABLE `studentassessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `studentenrollments`
--

DROP TABLE IF EXISTS `studentenrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `studentenrollments` (
  `EnrollmentId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `StudentId` int NOT NULL,
  `CourseId` int NOT NULL,
  `BatchId` int NOT NULL,
  `IsActive` tinyint(1) NOT NULL,
  `EnrolledAt` datetime(6) NOT NULL,
  `EndedAt` datetime(6) DEFAULT NULL,
  `ActiveCourseId` int GENERATED ALWAYS AS ((case when (`IsActive` = 1) then `CourseId` else NULL end)) STORED,
  PRIMARY KEY (`EnrollmentId`),
  UNIQUE KEY `UX_StudentEnrollments_ActiveCourse` (`OrganizationId`,`StudentId`,`ActiveCourseId`),
  KEY `IX_StudentEnrollments_BatchId` (`BatchId`),
  KEY `IX_StudentEnrollments_CourseId` (`CourseId`),
  KEY `IX_StudentEnrollments_OrganizationId_BatchId_IsActive` (`OrganizationId`,`BatchId`,`IsActive`),
  KEY `IX_StudentEnrollments_StudentId` (`StudentId`),
  CONSTRAINT `FK_StudentEnrollments_Batches_BatchId` FOREIGN KEY (`BatchId`) REFERENCES `batches` (`BatchId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_StudentEnrollments_Courses_CourseId` FOREIGN KEY (`CourseId`) REFERENCES `courses` (`CourseId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_StudentEnrollments_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_StudentEnrollments_Students_StudentId` FOREIGN KEY (`StudentId`) REFERENCES `students` (`StudentId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `studentenrollments`
--

LOCK TABLES `studentenrollments` WRITE;
/*!40000 ALTER TABLE `studentenrollments` DISABLE KEYS */;
INSERT INTO `studentenrollments` (`EnrollmentId`, `OrganizationId`, `StudentId`, `CourseId`, `BatchId`, `IsActive`, `EnrolledAt`, `EndedAt`) VALUES (1,1,1,1,3,1,'2026-11-02 06:52:48.629490',NULL),(2,1,2,3,1,1,'2026-11-02 08:58:26.179666',NULL),(3,1,3,3,1,1,'2026-11-02 10:11:25.797695',NULL),(4,1,4,5,2,1,'2026-11-02 11:08:52.357951',NULL),(5,1,5,3,1,1,'2026-11-03 10:03:58.470745',NULL),(6,1,6,5,2,1,'2026-11-03 11:47:45.584705',NULL),(7,1,7,5,2,1,'2026-11-03 12:04:58.783533',NULL),(8,1,8,9,5,1,'2026-11-06 10:24:22.926780',NULL),(9,1,9,1,3,1,'2026-11-06 10:27:40.997864',NULL),(10,1,10,3,1,1,'2026-11-09 05:30:37.713830',NULL),(11,1,10,5,2,1,'2026-11-09 05:30:40.497244',NULL),(12,1,2,5,2,1,'2026-11-09 05:43:13.072256',NULL),(13,1,7,3,1,1,'2026-11-11 05:54:37.652787',NULL),(14,1,11,3,1,1,'2026-11-11 06:04:45.975480',NULL),(15,1,11,1,3,1,'2026-11-11 06:04:48.104114',NULL),(16,1,12,1,3,1,'2026-11-11 06:41:13.054334',NULL),(17,1,13,1,3,1,'2026-11-11 08:59:38.562488',NULL),(18,1,12,3,1,1,'2026-11-13 04:56:43.437203',NULL),(19,1,14,2,6,1,'2026-11-18 05:00:08.700956',NULL),(20,1,15,2,6,1,'2026-11-18 05:49:51.972888',NULL);
/*!40000 ALTER TABLE `studentenrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `StudentId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `FirstName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `LastName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Phone` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CourseId` int NOT NULL,
  `BatchId` int NOT NULL,
  `MentorId` int DEFAULT NULL,
  `CourseDates` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `Attendance` decimal(5,2) NOT NULL,
  `AssessmentsCleared` int NOT NULL,
  `Status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PasswordHash` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `GoogleSubjectId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ProfilePhotoUrl` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `IsDeleted` tinyint(1) NOT NULL,
  `DeletedOn` datetime(6) DEFAULT NULL,
  `DeletedBy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`StudentId`),
  UNIQUE KEY `IX_Students_GoogleSubjectId` (`GoogleSubjectId`),
  KEY `IX_Students_BatchId` (`BatchId`),
  KEY `IX_Students_CourseId` (`CourseId`),
  KEY `IX_Students_Email` (`Email`),
  KEY `IX_Students_MentorId` (`MentorId`),
  KEY `IX_Students_OrganizationId_Email` (`OrganizationId`,`Email`),
  CONSTRAINT `FK_Students_Batches_BatchId` FOREIGN KEY (`BatchId`) REFERENCES `batches` (`BatchId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_Students_Courses_CourseId` FOREIGN KEY (`CourseId`) REFERENCES `courses` (`CourseId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_Students_Mentors_MentorId` FOREIGN KEY (`MentorId`) REFERENCES `mentors` (`MentorId`),
  CONSTRAINT `FK_Students_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,1,'Test','Student','test.student@example.com','9876543210',1,3,3,'',0.00,0,'Active','',NULL,NULL,1,'2026-11-02 11:09:33.055044','OrganizationAdmin'),(2,1,'Test','MAHI','srinivas1234@gmail.com','9876543211',3,1,1,'',0.00,0,'Inactive','',NULL,NULL,0,NULL,NULL),(3,1,'mahesh','DHONI','maheshdhoni@gmail.com','7566566433',3,1,6,'',0.00,0,'Active','',NULL,NULL,0,NULL,NULL),(4,1,'srinivas','viajy','srinish@gmail.com','7476566388',5,2,1,'',0.00,0,'Active','',NULL,NULL,0,NULL,NULL),(5,1,'Test','Student','YOUR_PERSONAL_GMAIL@gmail.com','9876543210',3,1,1,'',0.00,0,'Active','',NULL,NULL,0,NULL,NULL),(6,1,'Rahul','Kumar','your_test_email@gmail.com','9876543210',5,2,1,'',0.00,0,'Active','',NULL,NULL,0,NULL,NULL),(7,1,'vishal','babu','vishalgoud664@gmail.com','7981948102',5,2,1,'',0.00,0,'Active','',NULL,'/uploads/profile-photos/student/7_fbc01e2c8bb54a3b9de81dfacb1f07f4.jpg',0,NULL,NULL),(8,1,'Luna','John','lunajohn123@gmail.com','9643777288',9,5,5,'',0.00,0,'Active','',NULL,NULL,0,NULL,NULL),(9,1,'Durvan','Dontala','durvandontala123@gmail.com','9848026571',1,3,1,'',0.00,0,'Active','',NULL,NULL,0,NULL,NULL),(10,1,'Venkata','Vedansh','vedansh@gmail.com','6324527432',3,1,1,'',0.00,0,'Active','',NULL,NULL,1,'2026-11-09 05:38:39.129127','OrganizationAdmin'),(11,1,'Mukesh','yedida','mukesh@gmail.com','8125336729',3,1,6,'',0.00,0,'Active','',NULL,NULL,0,NULL,NULL),(12,1,'Narendra','Kumar','narendra@gmail.com','7645623542',1,3,1,'',0.00,0,'Active','',NULL,'/uploads/profile-photos/student/12_ae3ccaa84fe748b6917f74d05160bf69.png',0,NULL,NULL),(13,1,'saiiiii','rapur','sairapur@gmail.com','8777584499',1,3,1,'',0.00,0,'Active','',NULL,NULL,0,NULL,NULL),(14,1,'kadiveti','Narendra','kadivetinarendra2000@gmail.com','6300044926',2,6,1,NULL,0.00,0,'Active','',NULL,NULL,1,'2026-11-18 05:36:53.957441','OrganizationAdmin'),(15,1,'kadiveti','Naren','kadivetinarendra2104@gmail.com','6300044926',2,6,1,NULL,0.00,0,'Active','','117291132279218592051',NULL,0,NULL,NULL);
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `SubscriptionId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int NOT NULL,
  `PlanName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Price` decimal(18,2) NOT NULL,
  `DurationInMonths` int NOT NULL,
  `MaxUsers` int NOT NULL,
  `StartDate` datetime(6) NOT NULL,
  `ExpiryDate` datetime(6) NOT NULL,
  `IsActive` tinyint(1) NOT NULL,
  PRIMARY KEY (`SubscriptionId`),
  KEY `IX_Subscriptions_OrganizationId` (`OrganizationId`),
  CONSTRAINT `FK_Subscriptions_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `superadmins`
--

DROP TABLE IF EXISTS `superadmins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `superadmins` (
  `SuperAdminId` int NOT NULL AUTO_INCREMENT,
  `Email` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PasswordHash` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IsActive` tinyint(1) NOT NULL,
  PRIMARY KEY (`SuperAdminId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `superadmins`
--

LOCK TABLES `superadmins` WRITE;
/*!40000 ALTER TABLE `superadmins` DISABLE KEYS */;
INSERT INTO `superadmins` VALUES (1,'admin@talentsphere.com','AQAAAAIAAYagAAAAENrN86TEwHjkdaS5bLM1R29lq9SNhSQrvIPhOylO4UJISxvqbJn69mmFE8RVqJEj1w==',1);
/*!40000 ALTER TABLE `superadmins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `TeamId` int NOT NULL AUTO_INCREMENT,
  `Name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DepartmentId` int NOT NULL,
  `ManagerId` int DEFAULT NULL,
  PRIMARY KEY (`TeamId`),
  KEY `IX_Teams_DepartmentId` (`DepartmentId`),
  KEY `IX_Teams_ManagerId` (`ManagerId`),
  CONSTRAINT `FK_Teams_Departments_DepartmentId` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`DepartmentId`) ON DELETE CASCADE,
  CONSTRAINT `FK_Teams_Employees_ManagerId` FOREIGN KEY (`ManagerId`) REFERENCES `employees` (`EmployeeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userpermissions`
--

DROP TABLE IF EXISTS `userpermissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userpermissions` (
  `UserPermissionId` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `PermissionId` int NOT NULL,
  `CanView` tinyint(1) NOT NULL,
  `CanAdd` tinyint(1) NOT NULL,
  `CanEdit` tinyint(1) NOT NULL,
  `CanDelete` tinyint(1) NOT NULL,
  `CanAccess` tinyint(1) NOT NULL,
  PRIMARY KEY (`UserPermissionId`),
  KEY `IX_UserPermissions_PermissionId` (`PermissionId`),
  KEY `IX_UserPermissions_UserId` (`UserId`),
  CONSTRAINT `FK_UserPermissions_Permissions_PermissionId` FOREIGN KEY (`PermissionId`) REFERENCES `permissions` (`PermissionId`) ON DELETE CASCADE,
  CONSTRAINT `FK_UserPermissions_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`UserId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userpermissions`
--

LOCK TABLES `userpermissions` WRITE;
/*!40000 ALTER TABLE `userpermissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `userpermissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `UserId` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int DEFAULT NULL,
  `FirstName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `LastName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Email` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `PasswordHash` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Role` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Phone` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `IsEmailVerified` tinyint(1) NOT NULL,
  `IsPhoneVerified` tinyint(1) NOT NULL,
  `CreatedDate` datetime(6) NOT NULL,
  `IsDeleted` tinyint(1) NOT NULL,
  `DeletedOn` datetime(6) DEFAULT NULL,
  `DeletedBy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`UserId`),
  KEY `IX_Users_OrganizationId` (`OrganizationId`),
  CONSTRAINT `FK_Users_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'MAHESH','MAHI','maherishi31@gmail.com','$2a$11$lsG0vvDynrRRj99QFafYceJx48tuwy2udNkrCcxDhBtXKIozDdiWW','Mentor','',1,1,'2026-11-02 06:45:42.324060',0,NULL,NULL),(2,1,'MANI TEJA','PULLIIIIII','maniteja123@gmail.com','$2a$11$hRfmup8Yq7/F2.kgYPQogeoR9wA1C2P5.GJJfDo/QwmlKRWXGIkgC','Mentor','7577638938',1,1,'2026-11-02 06:47:05.708978',0,NULL,NULL),(3,1,'nani','hari','nani12@gmail.com','$2a$11$em0r044pxZsTDXv8IcObOO1gg3qRq58EYkfJWaXhyg0lQdcVckRyq','Mentor','6474738829',1,1,'2026-11-02 06:48:23.050170',0,NULL,NULL),(4,1,'narendra','krishna','narendrakrishna@gmail.com','$2a$11$qiRbtQCbRg6H7dlwEB.4le4yh26H4rJrOgOK84dGpbvX/Xx4nOMf.','Mentor','8974774747',1,1,'2026-11-02 06:49:06.368246',0,NULL,NULL),(5,1,'Test','Student','test.student@example.com','$2a$11$SeHmADmlw8DC5ErzEtXQZuCkCFe3YSr32qJKjSOfvS24skMQNQTdK','Student','9876543210',1,1,'2026-11-02 06:52:49.600412',0,NULL,NULL),(6,1,'Test','MAHI','srinivas1234@gmail.com','$2a$11$etFZ9TgCMFHUMRadezRTS.R/eqfWxpydDzqYn0wujrPpgo4h3fmme','Student','9876543211',1,1,'2026-11-02 08:58:26.991118',0,NULL,NULL),(7,1,'maheshhhhh','DHONI','maheshdhoni@gmail.com','$2a$11$9ypPBTirOIXQEsFIQd7I8.vdlq7OzT1QN3jm21NC1aKp7Xid5RiWq','Student','7566566433',1,1,'2026-11-02 11:08:34.837674',0,NULL,NULL),(8,1,'srinivas','viajy','srinish@gmail.com','$2a$11$zvPLoY8d7CZs.QyEcH8tkOwAWkW5EzdGdJRbamaZ0SLKa6IaI48m6','Student','7476566388',1,1,'2026-11-02 11:08:53.103746',0,NULL,NULL),(9,1,'Test','Student','YOUR_PERSONAL_GMAIL@gmail.com','$2a$11$xIyBn0MNx0T83vx35ZvvIeF0n7kkjtgwywKBflVkujWBoLb5Q4ejS','Student','9876543210',1,1,'2026-11-03 10:11:55.222274',0,NULL,NULL),(10,1,'Rahul','Kumar','your_test_email@gmail.com','$2a$11$YEsDQzT.wx1cKTjnmgYjsel7e5CeLu07sAFHus3v.wq.heArgEtKm','Student','9876543210',1,1,'2026-11-03 11:51:52.313006',0,NULL,NULL),(11,1,'vishal','babu','vishalgoud664@gmail.com','$2a$11$AfATrjvEDpXe1Ut9JFDDB.R1lR3XH2eaVsLfaLBsXZb/Bm2Gg.Auu','Student','6981948102',1,1,'2026-11-03 12:05:15.209812',0,NULL,NULL),(12,1,'poorna','Bhai','srinivasarepally79@gmail.com','$2a$11$.hXhSb8CQKek7dKcWB7rY.yFH4I3rn1swsjUig6tfXEHVrp6I.Mzq','HR','8599588576',1,1,'2026-11-05 12:13:30.091394',0,NULL,NULL),(13,1,'Luna','Grace','lunagrace123@gmail.com','$2a$11$/myt2hlsG53DTddmcgwth.D5.2DmJUocrVDyVKR9ORTo8dfdSme4i','Mentor','9989225788',1,1,'2026-11-06 05:40:51.334553',0,NULL,NULL),(14,1,'Hima','Gandikota','himagandikota123@gmail.com','$2a$11$bYwHSMhRJnTMTESQh/ZgduAnppJOdfSj.CIdNhVE6rJbojsC0mIDO','Mentor','9879564731',1,1,'2026-11-06 10:10:29.023943',0,NULL,NULL),(15,1,'Luna','John','lunajohn123@gmail.com','$2a$11$wAhsahb50HMqMjLpn0S.cOfkBGedlDPMMJkInGQDdiqYis6sjRbCC','Student','9643777288',1,1,'2026-11-06 10:24:24.293454',0,NULL,NULL),(16,1,'Durvan','Dontala','durvandontala123@gmail.com','$2a$11$C4yGZV1xTtf8uvQw.0kKveohHYvA8dZk6oyoowYL/2sfJyqW93Ewe','Student','9848026571',1,1,'2026-11-06 10:28:01.533617',0,NULL,NULL),(17,1,'Bhuvan','Dontala','bhuvandontala123@gmail.com','$2a$11$V4awl8IWkKvyJvHqU9v7UuKIAn3Z7KbszQMsiaWXk84jvcxrTroT2','HR','9242678589',1,1,'2026-11-06 10:32:19.682706',0,NULL,NULL),(18,1,'Venkata','Vedansh','vedansh@gmail.com','$2a$11$4RbtBBmOgSEf0/sYWEX2mumfhwihe/uEm19CvZbiHKcAlwSH21eui','Student','6324527432',1,1,'2026-11-09 05:37:22.505875',0,NULL,NULL),(19,1,'Mukesh','yedida','mukesh@gmail.com','$2a$11$iLe4C/yP0kz5moAfdYEdxulV4V8UIDhOGOXHuSX7ZGDJ1VbeUFHfq','Student','8125336729',1,1,'2026-11-11 06:05:19.991400',0,NULL,NULL),(20,1,'Narendra','Kumar','narendra@gmail.com','$2a$11$YpuFW8NzE3ddhg2SN0kyUeMvO1ARuwnR8nw8nmpY0EtWQKc7nX2Ra','Student','7645623542',1,1,'2026-11-11 06:42:55.352154',0,NULL,NULL),(21,1,'saiiiii','rapur','sairapur@gmail.com','$2a$11$xHCYZSrOrltsC/zsVR3M8.oAgxpRynOL2OzhNiPi/wmO367As31RS','Student','8777584499',1,1,'2026-11-11 09:38:00.560264',0,NULL,NULL),(22,1,'kadiveti','Narendra','kadivetinarendra2000@gmail.com','$2a$11$8xxn3Rpd2AogkwVcWd7Y5.PmsIyNPPjUv2uwKpS2y1bY4HHCLXOFu','Student','6300044926',1,0,'2026-11-18 05:00:09.990208',0,NULL,NULL),(23,1,'kadiveti','Naren','kadivetinarendra2104@gmail.com','$2a$11$8nZQQ3Hbni78XisYdrXx9e7nYRMjKwsVw7UB2Fz0.mI431qQZoFRy','Student',NULL,1,0,'2026-11-18 05:49:53.989971',0,NULL,NULL),(24,1,'Mani','Teja','mani@gmail.com','$2a$11$ASHiIQ88ZA/ntclYyhEIBeM5F14WpVm9OURYKUCjftNEQ2PtTF1te','Mentor','9871442345',1,1,'2026-11-18 07:25:01.247068',0,NULL,NULL),(25,1,'kadiveti','narenhshd','kadivetinarendra214@gmail.com','$2a$11$UvCccAEozz4HLzvzUo62C.9p9hJGnhH9QJ9BrI.g/zLlccwOfGqfC','Mentor','7281772187',1,1,'2026-11-18 14:57:14.613880',0,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'talentspheredb9'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-19 11:23:42
