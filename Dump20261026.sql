-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: talentspheredb
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

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
INSERT INTO `__efmigrationshistory` VALUES ('20261022092454_InitialCreate','8.0.18'),('20261025145217_AddBatchModuleCompletion','8.0.18');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessmentoptions`
--

LOCK TABLES `assessmentoptions` WRITE;
/*!40000 ALTER TABLE `assessmentoptions` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessmentquestions`
--

LOCK TABLES `assessmentquestions` WRITE;
/*!40000 ALTER TABLE `assessmentquestions` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessments`
--

LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendances`
--

LOCK TABLES `attendances` WRITE;
/*!40000 ALTER TABLE `attendances` DISABLE KEYS */;
INSERT INTO `attendances` VALUES (20,8,0.00,9,NULL,NULL,0,'Pending',0,0,1,0,NULL,0,NULL,NULL),(21,8,0.00,13,NULL,NULL,0,'Pending',0,0,1,0,NULL,0,NULL,NULL),(22,10,0.00,13,NULL,NULL,0,'Pending',0,0,1,0,NULL,0,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendancesessions`
--

LOCK TABLES `attendancesessions` WRITE;
/*!40000 ALTER TABLE `attendancesessions` DISABLE KEYS */;
INSERT INTO `attendancesessions` VALUES (7,22,'2026-10-26 05:46:53.338732',NULL,0,'app:10:72ec211a2ef7486fa545edda5003e93a','padmasree123@gmail.com','padma sree',0);
/*!40000 ALTER TABLE `attendancesessions` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batches`
--

LOCK TABLES `batches` WRITE;
/*!40000 ALTER TABLE `batches` DISABLE KEYS */;
INSERT INTO `batches` VALUES (1,1,'Java Full Stack 1',1,2,0,'2026-10-22 00:00:00.000000','2027-01-22 00:00:00.000000',25,1,0,0,'',0,'2026-10-22 09:39:42.903403',NULL),(2,1,'React.JS 1',1,1,0,'2026-10-22 00:00:00.000000','2026-12-22 00:00:00.000000',25,0,0,0,'',1,'2026-10-22 10:04:51.096839',NULL),(3,1,'RPA 1',3,3,0,'2026-10-23 00:00:00.000000','2026-12-23 00:00:00.000000',25,0,0,0,'',0,'2026-10-22 10:08:10.037136',NULL),(4,1,'React.JS 2',1,1,0,'2026-10-22 00:00:00.000000','2026-12-22 00:00:00.000000',25,3,0,0,'',1,'2026-10-22 10:12:22.447210','2026-10-25 12:02:48.781342'),(7,1,'Java Full Stack 2',2,2,0,'2026-10-23 00:00:00.000000','2026-11-23 00:00:00.000000',25,1,0,0,'',0,'2026-10-23 12:25:04.515400','2026-10-26 05:43:35.202561');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
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
INSERT INTO `chatconversations` VALUES (1,1,1,6,'2026-10-23 09:44:23.110418',NULL,1);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatmessages`
--

LOCK TABLES `chatmessages` WRITE;
/*!40000 ALTER TABLE `chatmessages` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courselessons`
--

LOCK TABLES `courselessons` WRITE;
/*!40000 ALTER TABLE `courselessons` DISABLE KEYS */;
INSERT INTO `courselessons` VALUES (1,1,1,'What is Java?','Understand Java, the JVM, JRE, and JDK.'),(2,1,2,'Java Features','Explore portability, security, and object-oriented programming.'),(3,1,3,'Installing JDK and IDE','Set up Java with IntelliJ IDEA or Eclipse.'),(4,1,4,'First Java Program','Compile and run a simple Java application.'),(5,2,1,'Variables and Data Types','Use primitive types, variables, and type conversion.'),(6,2,2,'Operators and Expressions','Apply arithmetic, relational, and logical operators.'),(7,2,3,'Control Statements','Use if/else, switch, and loops.'),(8,2,4,'Arrays and Strings','Work with arrays and common String operations.'),(9,3,1,'Classes and Objects','Create classes, constructors, methods, and objects.'),(10,3,2,'Encapsulation and Inheritance','Organize and reuse code with access modifiers and inheritance.'),(11,3,3,'Polymorphism and Abstraction','Use overriding, interfaces, and abstract classes.'),(12,3,4,'Exception Handling','Handle checked and unchecked exceptions safely.'),(13,4,1,'Collections Framework','Use List, Set, Map, and iterators.'),(14,4,2,'Generics and Streams','Write type-safe collections and process data with streams.'),(15,4,3,'File Handling','Read and write files using Java I/O and NIO.'),(16,4,4,'JDBC Basics','Connect Java applications to relational databases.'),(17,5,1,'HTML5 Structure','Build semantic pages, forms, and accessible markup.'),(18,5,2,'CSS3 and Responsive Design','Style layouts using Flexbox, Grid, and media queries.'),(19,5,3,'JavaScript Fundamentals','Use functions, arrays, objects, DOM, and events.'),(20,5,4,'Modern JavaScript','Work with ES modules, promises, async/await, and fetch.'),(21,6,1,'React Components and JSX','Build reusable UI components.'),(22,6,2,'Props, State, and Hooks','Manage state and effects in React.'),(23,6,3,'Routing and Forms','Create multi-page experiences and validate user input.'),(24,6,4,'API Integration','Consume backend REST APIs and handle loading and errors.'),(25,7,1,'Spring Framework Basics','Understand dependency injection and inversion of control.'),(26,7,2,'Spring Boot Setup','Create and configure a Spring Boot application.'),(27,7,3,'Controllers and REST Endpoints','Implement GET, POST, PUT, and DELETE endpoints.'),(28,7,4,'Service Layer and Validation','Structure business logic and validate requests.'),(29,8,1,'SQL and Database Design','Write queries, joins, and relational schemas.'),(30,8,2,'Spring Data JPA and Hibernate','Map entities and implement repositories.'),(31,8,3,'Spring Security','Protect endpoints and manage authorization.'),(32,8,4,'JWT Authentication','Implement token-based login and secured API access.'),(33,9,1,'React and Spring Boot Integration','Connect UI workflows to REST endpoints and configure CORS.'),(34,9,2,'Git and Maven','Use version control, dependency management, and builds.'),(35,9,3,'Unit and API Testing','Test Java services with JUnit/Mockito and verify REST endpoints.'),(36,9,4,'Error Handling and Logging','Handle failures and collect useful application logs.'),(37,10,1,'Full Stack CRUD Project','Build a complete application with React, Spring Boot, and SQL.'),(38,10,2,'Authentication and Roles','Implement login and role-based access across the stack.'),(39,10,3,'Production Configuration','Manage environment settings and secrets.'),(40,10,4,'Deployment Basics','Build and deploy frontend, backend, and database services.'),(41,11,1,'What is React.js?','Understand React and component-based user interfaces.'),(42,11,2,'React Features','Learn declarative rendering, reusable components, and the virtual DOM.'),(43,11,3,'React Application Architecture','Understand the component tree and one-way data flow.'),(44,12,1,'Installing Node.js and Vite','Set up a React project using Node.js, npm, and Vite.'),(45,12,2,'React Project Structure','Explore the main files and folders in a React application.'),(46,12,3,'JSX Syntax','Write UI markup using JSX expressions and attributes.'),(47,13,1,'Functional Components','Create and reuse functional React components.'),(48,13,2,'Props','Pass data from parent to child components.'),(49,13,3,'Conditional Rendering','Display UI elements based on conditions.'),(50,13,4,'Rendering Lists and Keys','Render collections safely with unique keys.'),(51,14,1,'useState Hook','Manage local component state.'),(52,14,2,'Event Handling','Handle clicks, inputs, and other user interactions.'),(53,14,3,'Forms and Controlled Inputs','Build forms with controlled inputs and basic validation.'),(54,15,1,'useEffect Hook','Manage effects, subscriptions, and cleanup.'),(55,15,2,'useRef Hook','Access mutable values and DOM references.'),(56,15,3,'useMemo and useCallback','Understand memoization for selected performance needs.'),(57,15,4,'Custom Hooks','Extract reusable stateful logic into custom hooks.'),(58,16,1,'React Router','Configure routes, navigation, and route parameters.'),(59,16,2,'Context API','Share state without passing props through every level.'),(60,16,3,'State Management Basics','Understand when to use Context or a state management library.'),(61,17,1,'Fetching Data','Retrieve server data using fetch or Axios.'),(62,17,2,'Loading and Error States','Display loading indicators, empty states, and errors.'),(63,17,3,'CRUD Operations','Create, read, update, and delete records through APIs.'),(64,18,1,'CSS and Responsive Layouts','Style components using CSS and responsive design techniques.'),(65,18,2,'Tailwind CSS Basics','Build utility-first React layouts with Tailwind CSS.'),(66,18,3,'Reusable UI Components','Build forms, cards, modals, and tables with reusable patterns.'),(67,18,4,'Form Validation','Validate user input and display useful feedback.'),(68,19,1,'Lazy Loading and Suspense','Split application code and load routes on demand.'),(69,19,2,'React Performance','Identify unnecessary renders and optimize when needed.'),(70,19,3,'Component Testing','Write basic component tests with React Testing Library.'),(71,19,4,'Error Boundaries','Handle rendering failures with error boundaries.'),(72,20,1,'Authentication and Protected Routes','Understand login state and route protection in the frontend.'),(73,20,2,'Environment Variables','Configure public client-side environment values safely.'),(74,20,3,'Build and Deployment','Create production builds and deploy a React application.'),(75,20,4,'Final React Project','Develop and deploy a small React application with API integration.');
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coursemodules`
--

LOCK TABLES `coursemodules` WRITE;
/*!40000 ALTER TABLE `coursemodules` DISABLE KEYS */;
INSERT INTO `coursemodules` VALUES (1,2,1,'Java Fundamentals','Learn Java syntax, setup, core programming concepts, and object-oriented basics.'),(2,2,2,'Core Java and Object-Oriented Programming','Build reusable Java applications using OOP, collections, and exception handling.'),(3,2,3,'Frontend Development','Create responsive user interfaces using HTML, CSS, JavaScript, and React.'),(4,2,4,'Backend Development with Spring Boot','Build secure REST APIs with Spring Boot, persistence, and authentication.'),(5,2,5,'Full Stack Integration, Testing and Deployment','Connect frontend and backend, test features, and deploy a complete Java full stackproject.'),(6,1,1,'React.js Fundamentals','Introduction to React.js, modern frontend development, environment setup, and JSX.'),(7,1,2,'Components, Props and State','Build reusable components and manage interactive user interfaces.'),(8,1,3,'Hooks, Routing and State Management','Use React hooks, navigation, and shared application state.'),(9,1,4,'API Integration and UI Development','Connect React applications to backend APIs and build responsive interfaces.'),(10,1,5,'Advanced React, Testing and Deployment','Optimize, test, secure, and deploy a complete React application.');
/*!40000 ALTER TABLE `coursemodules` ENABLE KEYS */;
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
  `MentorId` int DEFAULT NULL,
  PRIMARY KEY (`CourseId`),
  KEY `IX_Courses_MentorId` (`MentorId`),
  KEY `IX_Courses_OrganizationId_CourseName` (`OrganizationId`,`CourseName`),
  CONSTRAINT `FK_Courses_Mentors_MentorId` FOREIGN KEY (`MentorId`) REFERENCES `mentors` (`MentorId`),
  CONSTRAINT `FK_Courses_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,1,'React.JS','',NULL,'2 Months','Beginner',24998.00,'/coursepdfs/735d201a-c226-4b0f-b7ac-29d6b40977a7.pdf',1,NULL),(2,1,'Java Full Stack','',NULL,'4 Months','Beginner',29984.00,'/coursepdfs/34d387ff-5401-4050-bb2a-6f63c81437d0.pdf',1,NULL),(3,1,'RPA','',NULL,'2 Months','Beginner',25000.00,'/coursepdfs/fd68c0cc-33ff-4b7c-a6ad-271cf5db8d4c.pdf',1,NULL),(4,1,'RPA','',NULL,'2 Months','Intermediate',25000.00,NULL,1,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coursetopics`
--

LOCK TABLES `coursetopics` WRITE;
/*!40000 ALTER TABLE `coursetopics` DISABLE KEYS */;
INSERT INTO `coursetopics` VALUES (1,1,1,'Introduction and Setup',NULL),(2,1,2,'Java Programming Basics',NULL),(3,2,1,'Object-Oriented Java',NULL),(4,2,2,'Java Libraries and Data',NULL),(5,3,1,'Web Foundations',NULL),(6,3,2,'React Frontend',NULL),(7,4,1,'Spring Boot and REST APIs',NULL),(8,4,2,'Persistence and Security',NULL),(9,5,1,'Integration and Quality',NULL),(10,5,2,'Project and Deployment',NULL),(11,6,1,'Introduction to React.js',NULL),(12,6,2,'Environment Setup and JSX',NULL),(13,7,1,'React Components',NULL),(14,7,2,'State and Events',NULL),(15,8,1,'React Hooks',NULL),(16,8,2,'Routing and Shared State',NULL),(17,9,1,'Working with APIs',NULL),(18,9,2,'Styling and Reusable UI',NULL),(19,10,1,'Performance and Quality',NULL),(20,10,2,'Production and Project',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeeattendances`
--

LOCK TABLES `employeeattendances` WRITE;
/*!40000 ALTER TABLE `employeeattendances` DISABLE KEYS */;
INSERT INTO `employeeattendances` VALUES (1,1,2,'2026-10-22','2026-10-22 15:51:28.467372','2026-10-22 18:08:37.266473',2.29,'Pending',0,NULL,0,NULL,NULL),(2,1,2,'2026-10-23','2026-10-23 10:07:26.846665',NULL,0.00,'LateCheckout',1,'Late checkout: employee did not check out by 6:15 PM.',0,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeepermissions`
--

LOCK TABLES `employeepermissions` WRITE;
/*!40000 ALTER TABLE `employeepermissions` DISABLE KEYS */;
INSERT INTO `employeepermissions` VALUES (1,2,1,1,1,1,1,1),(2,2,2,1,1,1,1,1),(3,2,3,1,1,1,1,1),(4,2,4,1,1,1,1,1),(5,2,5,1,1,1,1,1),(6,2,6,1,1,1,1,1),(7,2,7,1,1,1,1,1),(8,2,8,1,1,1,1,1),(9,2,9,1,1,1,1,1),(10,2,10,1,1,1,1,1),(11,2,11,1,1,1,1,1),(12,2,12,1,1,1,1,1),(13,2,13,1,1,1,1,1),(14,2,14,1,1,1,1,1),(15,2,15,1,1,1,1,1),(16,2,17,1,1,1,1,1),(17,1,1,1,1,1,1,1),(18,1,2,1,1,1,1,1),(19,1,3,1,1,1,1,1),(20,1,4,1,1,1,1,1),(21,1,5,1,1,1,1,1),(22,1,6,1,1,1,1,1),(23,1,7,1,1,1,1,1),(24,1,8,1,1,1,1,1),(25,1,9,1,1,1,1,1),(26,1,10,1,1,1,1,1),(27,1,11,1,1,1,1,1),(28,1,12,1,1,1,1,1),(29,1,13,1,1,1,1,1),(30,1,14,1,1,1,1,1),(31,1,15,1,1,1,1,1),(32,1,17,1,1,1,1,1),(33,3,1,1,1,1,1,1),(34,3,2,1,1,1,1,1),(35,3,3,1,1,1,1,1),(36,3,4,1,1,1,1,1),(37,3,5,1,1,1,1,1),(38,3,6,1,1,1,1,1),(39,3,7,1,1,1,1,1),(40,3,8,1,1,1,1,1),(41,3,9,1,1,1,1,1),(42,3,10,1,1,1,1,1),(43,3,11,1,1,1,1,1),(44,3,12,1,1,1,1,1),(45,3,13,1,1,1,1,1),(46,3,14,1,1,1,1,1),(47,3,15,1,1,1,1,1),(48,3,17,1,1,1,1,1),(49,4,1,1,1,1,1,1),(50,4,2,1,1,1,1,1),(51,4,3,1,1,1,1,1),(52,4,4,1,1,1,1,1),(53,4,5,1,1,1,1,1),(54,4,6,1,1,1,1,1),(55,4,7,1,1,1,1,1),(56,4,8,1,1,1,1,1),(57,4,9,1,1,1,1,1),(58,4,10,1,1,1,1,1),(59,4,11,1,1,1,1,1),(60,4,12,1,1,1,1,1),(61,4,13,1,1,1,1,1),(62,4,14,1,1,1,1,1),(63,4,15,1,1,1,1,1),(64,4,17,1,1,1,1,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeeprofiles`
--

LOCK TABLES `employeeprofiles` WRITE;
/*!40000 ALTER TABLE `employeeprofiles` DISABLE KEYS */;
INSERT INTO `employeeprofiles` VALUES (1,1,2,'P2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-23 06:32:43.424353','2026-10-23 06:32:43.424531',0,NULL,NULL),(2,1,1,'P1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-24 10:47:43.757464','2026-10-24 10:47:43.757580',0,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,1,1,'POORNA','SAI','maherishi31@gmail.com','8938836472','HR','Active','Full-time','$2a$11$8GN6R9cYO8VxFqz20q9NDOpGrsqac/11.Hnn8d04AMgT4idxVdh0a',NULL,NULL,NULL,0,NULL,NULL),(2,1,2,'Srinivas','Poorna','srinivassree.appsec@gmail.com','8388377636','Mentor','Active','Full-time','$2a$11$ZH5jrqFZmwoyEtbE4dKm5ecIMegLIM8f5s7JeFuwizxuBwnmygqO2',NULL,NULL,NULL,0,NULL,NULL),(3,1,3,'Mahesh','s','purnasai99.ps@gmail.com','9488577577','Mentor','Active','Full-time','$2a$11$7Ex53qB0OxfJrEWUYOyUO.IRD2L/I5a4NNfR7Y7jZA/oNjLx/4W96',NULL,NULL,NULL,0,NULL,NULL),(4,1,5,'Suresh','Gandikota','suresh123@gmail.com','9441037604','Mentor','Active','Full-time','$2a$11$/s4zZiU5gqS.YnU9zc1qYuryGeDk./TZJZmpSXxOMC5/uO6RVCaju',NULL,NULL,NULL,0,NULL,NULL);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrannouncements`
--

LOCK TABLES `hrannouncements` WRITE;
/*!40000 ALTER TABLE `hrannouncements` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrsettings`
--

LOCK TABLES `hrsettings` WRITE;
/*!40000 ALTER TABLE `hrsettings` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaverequests`
--

LOCK TABLES `leaverequests` WRITE;
/*!40000 ALTER TABLE `leaverequests` DISABLE KEYS */;
INSERT INTO `leaverequests` VALUES (1,1,2,'Sick','2026-10-24','2026-10-24','Health issue','Pending',NULL,NULL,'2026-10-23 05:51:39.129277',NULL,0,NULL,NULL),(2,1,2,'Casual','2026-10-26','2026-10-26','Family function','Rejected',1,'2026-10-26 07:20:12.586192','2026-10-23 06:09:31.708245','reject',0,NULL,NULL);
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
  `ModuleId` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`LiveClassId`),
  KEY `IX_LiveClasses_BatchId` (`BatchId`),
  KEY `IX_LiveClasses_CourseId` (`CourseId`),
  KEY `IX_LiveClasses_MentorId` (`MentorId`),
  KEY `IX_LiveClasses_ModuleId` (`ModuleId`),
  CONSTRAINT `FK_LiveClasses_Batches_BatchId` FOREIGN KEY (`BatchId`) REFERENCES `batches` (`BatchId`) ON DELETE CASCADE,
  CONSTRAINT `FK_LiveClasses_CourseModules_ModuleId` FOREIGN KEY (`ModuleId`) REFERENCES `coursemodules` (`ModuleId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_LiveClasses_Courses_CourseId` FOREIGN KEY (`CourseId`) REFERENCES `courses` (`CourseId`) ON DELETE CASCADE,
  CONSTRAINT `FK_LiveClasses_Mentors_MentorId` FOREIGN KEY (`MentorId`) REFERENCES `mentors` (`MentorId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `liveclasses`
--

LOCK TABLES `liveclasses` WRITE;
/*!40000 ALTER TABLE `liveclasses` DISABLE KEYS */;
INSERT INTO `liveclasses` VALUES (9,'react js',NULL,1,4,1,'2026-10-26 00:00:00.000000','01:05:00.000000','01:09:00.000000','Jitsi','https://meet.jit.si/kiniedxhub-liveclass-9-a77a4a09','https://meet.jit.si/kiniedxhub-liveclass-9-a77a4a09','kiniedxhub-liveclass-9-a77a4a09','',0,NULL,NULL,NULL,NULL,NULL,NULL,'Live','2026-10-25 19:36:10.242898','2026-10-25 19:37:08.375681',0,7),(13,'react js',NULL,1,4,1,'2026-10-26 00:00:00.000000','11:08:00.000000','11:15:00.000000','Jitsi','https://meet.jit.si/kiniedxhub-liveclass-13-c98b60d2','https://meet.jit.si/kiniedxhub-liveclass-13-c98b60d2','kiniedxhub-liveclass-13-c98b60d2','',0,NULL,NULL,NULL,NULL,NULL,NULL,'Live','2026-10-26 05:39:01.861125','2026-10-26 05:40:31.939662',0,6);
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meetingevents`
--

LOCK TABLES `meetingevents` WRITE;
/*!40000 ALTER TABLE `meetingevents` DISABLE KEYS */;
INSERT INTO `meetingevents` VALUES (9,13,10,'d29b0877-9140-4bfa-9bec-b4e58a445dcc','kiniedxhub-liveclass-13-c98b60d2','14','padmasree123@gmail.com','padma sree','Joined','2026-10-26 05:47:46.096768',1),(10,13,10,'6afd4518-dbaa-46d1-be93-126c8fa8b21a','kiniedxhub-liveclass-13-c98b60d2','14','padmasree123@gmail.com','padma sree','Joined','2026-10-26 06:01:03.093789',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mentors`
--

LOCK TABLES `mentors` WRITE;
/*!40000 ALTER TABLE `mentors` DISABLE KEYS */;
INSERT INTO `mentors` VALUES (1,1,2,'Srinivas','Poorna','srinivassree.appsec@gmail.com','8388377636','$2a$11$ZH5jrqFZmwoyEtbE4dKm5ecIMegLIM8f5s7JeFuwizxuBwnmygqO2',1,'2026-10-22 09:35:32.751329',0,NULL,NULL),(2,1,3,'Mahesh','s','purnasai99.ps@gmail.com','9488577577','$2a$11$7Ex53qB0OxfJrEWUYOyUO.IRD2L/I5a4NNfR7Y7jZA/oNjLx/4W96',1,'2026-10-22 09:38:05.073232',0,NULL,NULL),(3,1,4,'Suresh','Gandikota','suresh123@gmail.com','9441037604','$2a$11$/s4zZiU5gqS.YnU9zc1qYuryGeDk./TZJZmpSXxOMC5/uO6RVCaju',1,'2026-10-22 09:58:42.202858',0,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,NULL,NULL,1,'New Course Created','Course \'React.JS\' has been created.',23,1,3,0,'2026-10-22 09:34:04.486318',NULL,NULL,NULL),(2,NULL,NULL,1,'New HR User Created','POORNA SAI has been added as an HR user.',18,1,10,0,'2026-10-22 09:34:24.204595',NULL,NULL,NULL),(3,NULL,NULL,1,'New Course Created','Course \'Java Full Stack\' has been created.',23,2,3,0,'2026-10-22 09:34:46.165615',NULL,NULL,NULL),(4,NULL,NULL,1,'New Course Created','Course \'RPA\' has been created.',23,3,3,0,'2026-10-22 09:35:32.595996',NULL,NULL,NULL),(5,NULL,NULL,1,'New Mentor Created','Srinivas Poorna has been added as a mentor.',12,2,6,0,'2026-10-22 09:35:37.668789',NULL,NULL,NULL),(6,NULL,NULL,1,'Employee Permissions Changed','Permissions for employee ID 2 have been updated.',38,2,9,0,'2026-10-22 09:37:06.360009',NULL,NULL,NULL),(7,NULL,NULL,1,'Employee Permissions Changed','Permissions for employee ID 1 have been updated.',38,1,9,0,'2026-10-22 09:37:22.555284',NULL,NULL,NULL),(8,NULL,NULL,1,'New Mentor Created','Mahesh s has been added as a mentor.',12,3,6,0,'2026-10-22 09:38:08.490522',NULL,NULL,NULL),(9,NULL,NULL,1,'New Batch Created','Batch \'Java Full Stack 1\' has been created.',25,1,4,0,'2026-10-22 09:39:43.054123',NULL,NULL,NULL),(10,NULL,NULL,1,'Employee Permissions Changed','Permissions for employee ID 2 have been updated.',38,2,9,0,'2026-10-22 09:43:52.128981',NULL,NULL,NULL),(11,NULL,NULL,1,'Employee Permissions Changed','Permissions for employee ID 3 have been updated.',38,3,9,0,'2026-10-22 09:44:15.690547',NULL,NULL,NULL),(12,1,NULL,NULL,'Live Class Scheduled','JAVA FUNDA is scheduled for 22 Oct 2026 at 03:30 PM.',1,1,1,0,'2026-10-22 09:57:11.732614',NULL,1,NULL),(13,NULL,1,NULL,'Live Class Scheduled','You successfully scheduled JAVA FUNDA for 22 Oct 2026 at 03:30 PM.',1,1,1,1,'2026-10-22 09:57:11.732705','2026-10-23 06:14:20.221887',1,NULL),(14,NULL,NULL,1,'Student Enrollment Approved','NANI Poorna has been approved for enrollment.',9,1,5,0,'2026-10-22 09:58:32.858648',NULL,NULL,NULL),(15,NULL,NULL,1,'New Mentor Created','Suresh Gandikota has been added as a mentor.',12,4,6,0,'2026-10-22 09:58:45.898831',NULL,NULL,NULL),(16,1,NULL,NULL,'Class Started','JAVA FUNDA has started. Join now.',5,1,1,0,'2026-10-22 09:58:52.384488',NULL,1,NULL),(17,NULL,1,NULL,'Class Started','You started JAVA FUNDA.',5,1,1,1,'2026-10-22 09:58:52.384491','2026-10-23 06:14:20.212733',1,NULL),(18,NULL,NULL,1,'Employee Permissions Changed','Permissions for employee ID 4 have been updated.',38,4,9,0,'2026-10-22 09:58:59.313560',NULL,NULL,NULL),(19,NULL,NULL,1,'New Batch Created','Batch \'React.JS 1\' has been created.',25,2,4,0,'2026-10-22 10:04:51.117819',NULL,NULL,NULL),(20,NULL,NULL,1,'New Batch Created','Batch \'RPA 1\' has been created.',25,3,4,0,'2026-10-22 10:08:10.054349',NULL,NULL,NULL),(21,NULL,NULL,1,'New Batch Created','Batch \'React.JS 2\' has been created.',25,4,4,0,'2026-10-22 10:12:22.469101',NULL,NULL,NULL),(22,1,NULL,NULL,'Class Started','JAVA FUNDA has started. Join now.',5,1,1,0,'2026-10-22 10:17:14.253094',NULL,1,NULL),(23,NULL,1,NULL,'Class Started','You started JAVA FUNDA.',5,1,1,1,'2026-10-22 10:17:14.253097','2026-10-23 06:11:55.950035',1,NULL),(24,1,NULL,NULL,'Class Ended','JAVA FUNDA has ended.',6,1,1,0,'2026-10-22 10:44:22.196915',NULL,1,NULL),(26,NULL,NULL,1,'New Course Created','Course \'RPA\' has been created.',23,4,3,0,'2026-10-22 10:51:43.272619',NULL,NULL,NULL),(27,NULL,NULL,1,'Student Enrollment Approved','Madhu Kadiviti has been approved for enrollment.',9,2,5,0,'2026-10-22 10:55:28.162423',NULL,NULL,NULL),(28,NULL,NULL,1,'Student Enrollment Approved','Banu Sambuturu has been approved for enrollment.',9,3,5,0,'2026-10-22 10:55:41.394285',NULL,NULL,NULL),(29,NULL,NULL,1,'Student Enrollment Approved','Sindhu Patti has been approved for enrollment.',9,4,5,0,'2026-10-22 10:55:53.956151',NULL,NULL,NULL),(30,NULL,NULL,1,'Student Enrollment Approved','Harinath Patti has been approved for enrollment.',9,5,5,0,'2026-10-22 10:56:08.424118',NULL,NULL,NULL),(31,NULL,NULL,1,'Student Enrollment Approved','Aruna Narsing has been approved for enrollment.',9,6,5,0,'2026-10-22 10:56:19.587754',NULL,NULL,NULL),(32,NULL,NULL,1,'Student Enrollment Approved','Raji Patti has been approved for enrollment.',9,7,5,0,'2026-10-22 10:56:30.505717',NULL,NULL,NULL),(33,NULL,NULL,1,'New Leave Request','Srinivas Poorna has submitted a Sick leave request from 24-10-2026 to 24-10-2026.',19,1,11,0,'2026-10-23 05:51:39.288656',NULL,NULL,NULL),(34,NULL,NULL,1,'New Leave Request','Srinivas Poorna has submitted a Casual leave request from 26-10-2026 to 26-10-2026.',19,2,11,0,'2026-10-23 06:09:31.735158',NULL,NULL,NULL),(35,1,NULL,NULL,'Live Class Scheduled','Student meeting: Aruna Nursing is scheduled for 23 Oct 2026 at 03:21 PM.',1,2,1,0,'2026-10-23 09:45:43.753834',NULL,1,NULL),(36,3,NULL,NULL,'Live Class Scheduled','Student meeting: Aruna Nursing is scheduled for 23 Oct 2026 at 03:21 PM.',1,2,1,0,'2026-10-23 09:45:43.753836',NULL,1,NULL),(37,6,NULL,NULL,'Live Class Scheduled','Student meeting: Aruna Nursing is scheduled for 23 Oct 2026 at 03:21 PM.',1,2,1,0,'2026-10-23 09:45:43.753837',NULL,1,NULL),(38,NULL,1,NULL,'Live Class Scheduled','You successfully scheduled Student meeting: Aruna Nursing for 23 Oct 2026 at 03:21 PM.',1,2,1,0,'2026-10-23 09:45:43.753842',NULL,1,NULL),(39,1,NULL,NULL,'Class Started','Student meeting: Aruna Nursing has started. Join now.',5,2,1,0,'2026-10-23 09:49:46.382068',NULL,1,NULL),(40,3,NULL,NULL,'Class Started','Student meeting: Aruna Nursing has started. Join now.',5,2,1,0,'2026-10-23 09:49:46.382070',NULL,1,NULL),(41,6,NULL,NULL,'Class Started','Student meeting: Aruna Nursing has started. Join now.',5,2,1,0,'2026-10-23 09:49:46.382070',NULL,1,NULL),(42,NULL,1,NULL,'Class Started','You started Student meeting: Aruna Nursing.',5,2,1,0,'2026-10-23 09:49:46.382168',NULL,1,NULL),(43,1,NULL,NULL,'Class Ended','Student meeting: Aruna Nursing has ended.',6,2,1,0,'2026-10-23 09:58:55.117272',NULL,1,NULL),(44,3,NULL,NULL,'Class Ended','Student meeting: Aruna Nursing has ended.',6,2,1,0,'2026-10-23 09:58:55.117275',NULL,1,NULL),(45,6,NULL,NULL,'Class Ended','Student meeting: Aruna Nursing has ended.',6,2,1,0,'2026-10-23 09:58:55.117275',NULL,1,NULL),(46,NULL,1,NULL,'Class Ended','You ended Student meeting: Aruna Nursing.',6,2,1,0,'2026-10-23 09:58:55.117277',NULL,1,NULL),(47,NULL,NULL,1,'Student Enrollment Approved','uday sai has been approved for enrollment.',9,8,5,0,'2026-10-23 11:16:03.439104',NULL,NULL,NULL),(48,NULL,NULL,1,'New Batch Created','Batch \'RPA Test (Claude)\' has been created.',25,5,4,0,'2026-10-23 11:21:15.832145',NULL,NULL,NULL),(49,NULL,NULL,1,'New Batch Created','Batch \'JFS Test (Claude)\' has been created.',25,6,4,0,'2026-10-23 12:22:24.082308',NULL,NULL,NULL),(50,NULL,NULL,1,'New Batch Created','Batch \'Java Full Stack 2\' has been created.',25,7,4,0,'2026-10-23 12:25:04.531861',NULL,NULL,NULL),(51,1,NULL,NULL,'Live Class Scheduled','java is scheduled for 23 Oct 2026 at 06:00 PM.',1,3,1,0,'2026-10-23 12:30:18.247082',NULL,1,NULL),(52,3,NULL,NULL,'Live Class Scheduled','java is scheduled for 23 Oct 2026 at 06:00 PM.',1,3,1,0,'2026-10-23 12:30:18.247085',NULL,1,NULL),(53,6,NULL,NULL,'Live Class Scheduled','java is scheduled for 23 Oct 2026 at 06:00 PM.',1,3,1,0,'2026-10-23 12:30:18.247085',NULL,1,NULL),(54,NULL,1,NULL,'Live Class Scheduled','You successfully scheduled java for 23 Oct 2026 at 06:00 PM.',1,3,1,0,'2026-10-23 12:30:18.247176',NULL,1,NULL),(55,NULL,NULL,1,'Course Updated','Course \'React.JS\' has been updated.',24,1,3,0,'2026-10-23 12:36:28.106908',NULL,NULL,NULL),(56,NULL,NULL,1,'Employee Permissions Changed','Permissions for employee ID 1 have been updated.',38,1,9,0,'2026-10-24 11:24:44.712268',NULL,NULL,NULL),(57,NULL,NULL,1,'Employee Permissions Changed','Permissions for employee ID 1 have been updated.',38,1,9,0,'2026-10-24 11:25:56.129982',NULL,NULL,NULL),(58,8,NULL,NULL,'Live Class Scheduled','test class is scheduled for 25 Oct 2026 at 09:43 AM.',1,4,1,0,'2026-10-25 04:14:30.106130',NULL,1,NULL),(59,NULL,1,NULL,'Live Class Scheduled','You successfully scheduled test class for 25 Oct 2026 at 09:43 AM.',1,4,1,0,'2026-10-25 04:14:30.106561',NULL,1,NULL),(60,8,NULL,NULL,'Class Started','test class has started. Join now.',5,4,1,0,'2026-10-25 04:19:24.877437',NULL,1,NULL),(61,NULL,1,NULL,'Class Started','You started test class.',5,4,1,0,'2026-10-25 04:19:24.877439',NULL,1,NULL),(62,8,NULL,NULL,'Class Ended','test class has ended.',6,4,1,0,'2026-10-25 04:32:15.116885',NULL,1,NULL),(63,NULL,1,NULL,'Class Ended','You ended test class.',6,4,1,0,'2026-10-25 04:32:15.116888',NULL,1,NULL),(64,8,NULL,NULL,'Live Class Scheduled','react js is scheduled for 25 Oct 2026 at 01:58 PM.',1,5,1,0,'2026-10-25 08:28:06.776108',NULL,1,NULL),(65,NULL,1,NULL,'Live Class Scheduled','You successfully scheduled react js for 25 Oct 2026 at 01:58 PM.',1,5,1,0,'2026-10-25 08:28:06.776119',NULL,1,NULL),(66,8,NULL,NULL,'Class Started','react js has started. Join now.',5,5,1,0,'2026-10-25 08:31:22.251363',NULL,1,NULL),(67,NULL,1,NULL,'Class Started','You started react js.',5,5,1,0,'2026-10-25 08:31:22.251366',NULL,1,NULL),(68,8,NULL,NULL,'Class Ended','react js has ended.',6,5,1,0,'2026-10-25 08:31:31.152035',NULL,1,NULL),(69,NULL,1,NULL,'Class Ended','You ended react js.',6,5,1,0,'2026-10-25 08:31:31.152037',NULL,1,NULL),(70,NULL,NULL,1,'Student Assigned to Batch','sai sree has been assigned to batch \'React.JS 2\'.',11,9,5,0,'2026-10-25 12:02:48.825480',NULL,NULL,NULL),(71,NULL,NULL,1,'Student Enrollment Approved','sai sree has been approved for enrollment.',9,9,5,0,'2026-10-25 12:03:00.444150',NULL,NULL,NULL),(72,1,NULL,NULL,'Live Class Scheduled','java is scheduled for 25 Oct 2026 at 06:50 PM.',1,6,1,0,'2026-10-25 13:21:19.958540',NULL,1,NULL),(73,3,NULL,NULL,'Live Class Scheduled','java is scheduled for 25 Oct 2026 at 06:50 PM.',1,6,1,0,'2026-10-25 13:21:19.958545',NULL,1,NULL),(74,6,NULL,NULL,'Live Class Scheduled','java is scheduled for 25 Oct 2026 at 06:50 PM.',1,6,1,0,'2026-10-25 13:21:19.958546',NULL,1,NULL),(75,9,NULL,NULL,'Live Class Scheduled','java is scheduled for 25 Oct 2026 at 06:50 PM.',1,6,1,0,'2026-10-25 13:21:19.958546',NULL,1,NULL),(76,NULL,1,NULL,'Live Class Scheduled','You successfully scheduled java for 25 Oct 2026 at 06:50 PM.',1,6,1,0,'2026-10-25 13:21:19.958555',NULL,1,NULL),(77,1,NULL,NULL,'Class Started','java has started. Join now.',5,6,1,0,'2026-10-25 13:21:47.135406',NULL,1,NULL),(78,3,NULL,NULL,'Class Started','java has started. Join now.',5,6,1,0,'2026-10-25 13:21:47.135408',NULL,1,NULL),(79,6,NULL,NULL,'Class Started','java has started. Join now.',5,6,1,0,'2026-10-25 13:21:47.135408',NULL,1,NULL),(80,9,NULL,NULL,'Class Started','java has started. Join now.',5,6,1,0,'2026-10-25 13:21:47.135409',NULL,1,NULL),(81,NULL,1,NULL,'Class Started','You started java.',5,6,1,0,'2026-10-25 13:21:47.135410',NULL,1,NULL),(82,1,NULL,NULL,'Class Ended','java has ended.',6,6,1,0,'2026-10-25 13:27:31.254842',NULL,1,NULL),(83,3,NULL,NULL,'Class Ended','java has ended.',6,6,1,0,'2026-10-25 13:27:31.254844',NULL,1,NULL),(84,6,NULL,NULL,'Class Ended','java has ended.',6,6,1,0,'2026-10-25 13:27:31.254844',NULL,1,NULL),(85,9,NULL,NULL,'Class Ended','java has ended.',6,6,1,0,'2026-10-25 13:27:31.254844',NULL,1,NULL),(86,NULL,1,NULL,'Class Ended','You ended java.',6,6,1,0,'2026-10-25 13:27:31.254846',NULL,1,NULL),(87,1,NULL,NULL,'Live Class Scheduled','java is scheduled for 25 Oct 2026 at 07:00 PM.',1,7,1,0,'2026-10-25 13:29:06.833359',NULL,1,NULL),(88,3,NULL,NULL,'Live Class Scheduled','java is scheduled for 25 Oct 2026 at 07:00 PM.',1,7,1,0,'2026-10-25 13:29:06.833361',NULL,1,NULL),(89,6,NULL,NULL,'Live Class Scheduled','java is scheduled for 25 Oct 2026 at 07:00 PM.',1,7,1,0,'2026-10-25 13:29:06.833362',NULL,1,NULL),(90,9,NULL,NULL,'Live Class Scheduled','java is scheduled for 25 Oct 2026 at 07:00 PM.',1,7,1,0,'2026-10-25 13:29:06.833362',NULL,1,NULL),(91,NULL,1,NULL,'Live Class Scheduled','You successfully scheduled java for 25 Oct 2026 at 07:00 PM.',1,7,1,0,'2026-10-25 13:29:06.833368',NULL,1,NULL),(92,1,NULL,NULL,'Class Started','java has started. Join now.',5,3,1,0,'2026-10-25 13:29:20.994917',NULL,1,NULL),(93,3,NULL,NULL,'Class Started','java has started. Join now.',5,3,1,0,'2026-10-25 13:29:20.994919',NULL,1,NULL),(94,6,NULL,NULL,'Class Started','java has started. Join now.',5,3,1,0,'2026-10-25 13:29:20.994919',NULL,1,NULL),(95,9,NULL,NULL,'Class Started','java has started. Join now.',5,3,1,0,'2026-10-25 13:29:20.994920',NULL,1,NULL),(96,NULL,1,NULL,'Class Started','You started java.',5,3,1,0,'2026-10-25 13:29:20.994921',NULL,1,NULL),(97,1,NULL,NULL,'Class Started','java has started. Join now.',5,7,1,0,'2026-10-25 13:29:38.721039',NULL,1,NULL),(98,3,NULL,NULL,'Class Started','java has started. Join now.',5,7,1,0,'2026-10-25 13:29:38.721041',NULL,1,NULL),(99,6,NULL,NULL,'Class Started','java has started. Join now.',5,7,1,0,'2026-10-25 13:29:38.721041',NULL,1,NULL),(100,9,NULL,NULL,'Class Started','java has started. Join now.',5,7,1,0,'2026-10-25 13:29:38.721041',NULL,1,NULL),(101,NULL,1,NULL,'Class Started','You started java.',5,7,1,0,'2026-10-25 13:29:38.721043',NULL,1,NULL),(102,1,NULL,NULL,'Class Ended','java has ended.',6,7,1,0,'2026-10-25 13:37:58.365091',NULL,1,NULL),(103,3,NULL,NULL,'Class Ended','java has ended.',6,7,1,0,'2026-10-25 13:37:58.365093',NULL,1,NULL),(104,6,NULL,NULL,'Class Ended','java has ended.',6,7,1,0,'2026-10-25 13:37:58.365093',NULL,1,NULL),(105,9,NULL,NULL,'Class Ended','java has ended.',6,7,1,0,'2026-10-25 13:37:58.365094',NULL,1,NULL),(106,NULL,1,NULL,'Class Ended','You ended java.',6,7,1,0,'2026-10-25 13:37:58.365095',NULL,1,NULL),(107,1,NULL,NULL,'Class Ended','java has ended.',6,3,1,0,'2026-10-25 13:38:00.714488',NULL,1,NULL),(108,3,NULL,NULL,'Class Ended','java has ended.',6,3,1,0,'2026-10-25 13:38:00.714490',NULL,1,NULL),(109,6,NULL,NULL,'Class Ended','java has ended.',6,3,1,0,'2026-10-25 13:38:00.714490',NULL,1,NULL),(110,9,NULL,NULL,'Class Ended','java has ended.',6,3,1,0,'2026-10-25 13:38:00.714491',NULL,1,NULL),(111,NULL,1,NULL,'Class Ended','You ended java.',6,3,1,0,'2026-10-25 13:38:00.714492',NULL,1,NULL),(112,8,NULL,NULL,'Live Class Scheduled','react js is scheduled for 25 Oct 2026 at 07:10 PM.',1,8,1,0,'2026-10-25 13:39:32.153723',NULL,1,NULL),(113,NULL,1,NULL,'Live Class Scheduled','You successfully scheduled react js for 25 Oct 2026 at 07:10 PM.',1,8,1,0,'2026-10-25 13:39:32.153731',NULL,1,NULL),(114,8,NULL,NULL,'Class Started','react js has started. Join now.',5,8,1,0,'2026-10-25 13:41:55.118595',NULL,1,NULL),(115,NULL,1,NULL,'Class Started','You started react js.',5,8,1,0,'2026-10-25 13:41:55.118598',NULL,1,NULL),(116,NULL,NULL,1,'Employee Permissions Changed','Permissions for employee ID 1 have been updated.',38,1,9,0,'2026-10-25 17:38:15.148841',NULL,NULL,NULL),(117,8,NULL,NULL,'Live Class Scheduled','react js is scheduled for 26 Oct 2026 at 01:05 AM.',1,9,1,0,'2026-10-25 19:36:11.542829',NULL,1,NULL),(118,NULL,1,NULL,'Live Class Scheduled','You successfully scheduled react js for 26 Oct 2026 at 01:05 AM.',1,9,1,0,'2026-10-25 19:36:11.543034',NULL,1,NULL),(119,8,NULL,NULL,'Class Started','react js has started. Join now.',5,9,1,0,'2026-10-25 19:37:08.410151',NULL,1,NULL),(120,NULL,1,NULL,'Class Started','You started react js.',5,9,1,0,'2026-10-25 19:37:08.410162',NULL,1,NULL),(121,8,NULL,NULL,'Live Class Scheduled','react js is scheduled for 26 Oct 2026 at 11:08 AM.',1,13,1,0,'2026-10-26 05:39:02.290136',NULL,1,NULL),(122,NULL,1,NULL,'Live Class Scheduled','You successfully scheduled react js for 26 Oct 2026 at 11:08 AM.',1,13,1,0,'2026-10-26 05:39:02.290230',NULL,1,NULL),(123,8,NULL,NULL,'Class Started','react js has started. Join now.',5,13,1,0,'2026-10-26 05:40:31.952294',NULL,1,NULL),(124,NULL,1,NULL,'Class Started','You started react js.',5,13,1,0,'2026-10-26 05:40:31.952296',NULL,1,NULL),(125,NULL,NULL,1,'Student Assigned to Batch','padma sree has been assigned to batch \'Java Full Stack 2\'.',11,10,5,0,'2026-10-26 05:43:35.230730',NULL,NULL,NULL),(126,NULL,NULL,1,'Student Enrollment Approved','padma sree has been approved for enrollment.',9,10,5,0,'2026-10-26 05:44:08.513058',NULL,NULL,NULL),(127,NULL,NULL,1,'Leave Request Rejected','Srinivas Poorna\'s leave request has been rejected.',21,2,11,0,'2026-10-26 07:20:12.620602',NULL,NULL,NULL),(128,NULL,NULL,NULL,'Leave Request Rejected','Your leave request has been rejected. Reason: reject',21,2,11,0,'2026-10-26 07:20:12.635313',NULL,NULL,2);
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
INSERT INTO `organizations` VALUES (1,'KINI','chinnilahari1225@gmail.com','6300092534','EDUTECH','INDIA','https://kiniedx.com/','$2a$11$goRmQ3/ezvaRYnVl6HcSRe2v66eR3xAg8lY5Bs1xxGQ4bo84uUHRe',NULL,'2026-10-22 09:31:52.462688');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otpverifications`
--

LOCK TABLES `otpverifications` WRITE;
/*!40000 ALTER TABLE `otpverifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `otpverifications` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'Dashboard',1),(2,'Employees',1),(3,'Courses',1),(4,'Batches',1),(5,'Attendance',1),(6,'Assessments',1),(7,'Reports',1),(8,'LiveClass',1),(9,'EmployeeProfile',1),(10,'Students',1),(11,'Leave Management',1),(12,'Performance',1),(13,'Resources',1),(14,'Announcements',1),(15,'Settings',1),(17,'Calendar',1);
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rolepermissions`
--

LOCK TABLES `rolepermissions` WRITE;
/*!40000 ALTER TABLE `rolepermissions` DISABLE KEYS */;
INSERT INTO `rolepermissions` VALUES (1,'SuperAdmin',NULL,1,1,1,1,1,1),(2,'SuperAdmin',NULL,2,1,1,1,1,1),(3,'SuperAdmin',NULL,3,1,1,1,1,1),(4,'SuperAdmin',NULL,4,1,1,1,1,1),(5,'SuperAdmin',NULL,5,1,1,1,1,1),(6,'SuperAdmin',NULL,6,1,1,1,1,1),(7,'SuperAdmin',NULL,7,1,1,1,1,1),(8,'HR',NULL,1,1,0,0,0,1),(9,'HR',NULL,2,1,1,1,0,1),(10,'HR',NULL,3,1,1,1,0,1),(11,'HR',NULL,4,1,1,1,0,1),(12,'HR',NULL,5,1,0,1,0,1),(13,'HR',NULL,6,1,0,0,0,1),(14,'HR',NULL,7,1,0,0,0,1),(15,'HR',NULL,11,1,1,1,0,1),(22,'Mentor',NULL,1,1,0,0,0,1),(23,'Mentor',NULL,2,0,0,0,0,0),(24,'Mentor',NULL,3,1,0,1,0,1),(25,'Mentor',NULL,4,1,0,1,0,1),(26,'Mentor',NULL,5,1,1,1,0,1),(27,'Mentor',NULL,6,1,1,1,0,1),(28,'Mentor',NULL,7,1,0,0,0,1),(29,'Employee',NULL,1,1,0,0,0,1),(30,'Employee',NULL,2,0,0,0,0,0),(31,'Employee',NULL,3,1,0,0,0,1),(32,'Employee',NULL,4,1,0,0,0,1),(33,'Employee',NULL,5,1,0,0,0,1),(34,'Employee',NULL,6,1,0,0,0,1),(35,'Employee',NULL,7,0,0,0,0,0),(36,'Organization',NULL,1,1,0,0,0,1),(37,'Organization',NULL,2,1,1,1,0,1),(38,'Organization',NULL,3,1,1,1,0,1),(39,'Organization',NULL,4,1,1,1,0,1),(40,'Organization',NULL,5,1,0,0,0,1),(41,'Organization',NULL,6,1,0,0,0,1),(42,'Organization',NULL,7,1,0,0,0,1),(43,'Student',NULL,1,1,0,0,0,1),(44,'Student',NULL,2,0,0,0,0,0),(45,'Student',NULL,3,1,0,0,0,1),(46,'Student',NULL,4,1,0,0,0,1),(47,'Student',NULL,5,1,0,0,0,1),(48,'Student',NULL,6,1,0,0,0,1),(49,'Student',NULL,7,0,0,0,0,0),(57,'SuperAdmin',NULL,8,1,1,1,1,1),(58,'SuperAdmin',NULL,9,1,1,1,1,1),(59,'HR',NULL,8,1,1,1,0,1),(60,'HR',NULL,9,1,1,1,0,1),(61,'OperationAssociate',NULL,8,1,1,1,0,1),(62,'OperationAssociate',NULL,9,1,1,1,0,1),(63,'Mentor',NULL,8,1,1,1,0,1),(64,'Mentor',NULL,9,1,1,1,0,1),(65,'Employee',NULL,8,1,0,0,0,1),(66,'Employee',NULL,9,1,1,1,0,1),(67,'Organization',NULL,8,1,1,1,0,1),(68,'Organization',NULL,9,1,1,1,0,1),(69,'Student',NULL,8,1,0,0,0,1),(70,'Student',NULL,9,0,0,0,0,0),(71,'OperationAssociate',NULL,1,1,0,0,0,1),(72,'OperationAssociate',NULL,2,1,0,0,0,1),(73,'OperationAssociate',NULL,3,1,0,0,0,1),(74,'OperationAssociate',NULL,4,1,1,1,0,1),(75,'OperationAssociate',NULL,5,1,1,1,0,1),(76,'OperationAssociate',NULL,6,1,0,0,0,1),(77,'OperationAssociate',NULL,7,1,0,0,0,1),(89,'HRRecruiter',NULL,1,1,0,0,0,1),(90,'HRRecruiter',NULL,2,1,1,1,0,1),(91,'HRRecruiter',NULL,3,1,1,1,0,1),(92,'HRRecruiter',NULL,4,1,1,1,0,1),(93,'HRRecruiter',NULL,5,1,0,1,0,1),(94,'HRRecruiter',NULL,6,1,0,0,0,1),(95,'HRRecruiter',NULL,7,1,0,0,0,1),(96,'HRRecruiter',NULL,8,1,1,1,0,1),(97,'HRRecruiter',NULL,9,1,1,1,0,1),(98,'HRExecutive',NULL,1,1,0,0,0,1),(99,'HRExecutive',NULL,2,1,1,1,0,1),(100,'HRExecutive',NULL,3,1,1,1,0,1),(101,'HRExecutive',NULL,4,1,1,1,0,1),(102,'HRExecutive',NULL,5,1,0,1,0,1),(103,'HRExecutive',NULL,6,1,0,0,0,1),(104,'HRExecutive',NULL,7,1,0,0,0,1),(105,'HRExecutive',NULL,8,1,1,1,0,1),(106,'HRExecutive',NULL,9,1,1,1,0,1),(107,'SuperAdmin',NULL,10,1,1,1,1,1),(108,'Organization',NULL,10,1,1,1,1,1),(109,'HR',NULL,10,1,1,1,1,1),(110,'HRRecruiter',NULL,10,1,1,1,0,1),(111,'HRExecutive',NULL,10,1,1,1,0,1),(112,'OperationAssociate',NULL,10,1,1,1,0,1),(113,'Mentor',NULL,10,1,0,0,0,1),(114,'Employee',NULL,10,0,0,0,0,0),(115,'Student',NULL,10,0,0,0,0,0),(116,'HR',NULL,12,1,0,0,0,1),(117,'HR',NULL,13,1,1,1,1,1),(118,'HR',NULL,14,1,1,1,1,1),(119,'HR',NULL,15,1,0,1,0,1),(121,'HR',NULL,17,1,1,1,1,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `studentenrollments`
--

LOCK TABLES `studentenrollments` WRITE;
/*!40000 ALTER TABLE `studentenrollments` DISABLE KEYS */;
INSERT INTO `studentenrollments` (`EnrollmentId`, `OrganizationId`, `StudentId`, `CourseId`, `BatchId`, `IsActive`, `EnrolledAt`, `EndedAt`) VALUES (1,1,8,1,4,1,'2026-10-23 11:16:03.170915',NULL),(2,1,9,2,1,1,'2026-10-25 12:02:47.592726',NULL),(3,1,9,1,4,1,'2026-10-25 12:02:48.781342',NULL),(4,1,10,1,4,1,'2026-10-26 05:43:34.376769',NULL),(5,1,10,2,7,1,'2026-10-26 05:43:35.202561',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,1,'NANI','Poorna','naninarayana891@gmail.com','8887756567',2,1,1,'',0.00,0,'Active','',NULL,NULL,0,NULL,NULL),(2,1,'Madhu','Kadiviti','madhu123@gmail.com','9867452313',3,3,3,'',0.00,0,'Active','',NULL,NULL,0,NULL,NULL),(3,1,'Banu','Sambuturu','banu123@gmail.com','9347468025',2,1,1,'',0.00,0,'Active','',NULL,NULL,0,NULL,NULL),(4,1,'Sindhu','Patti','sindhu123@gmail.com','9701025076',3,3,3,'',0.00,0,'Active','',NULL,NULL,0,NULL,NULL),(5,1,'Harinath','Patti','harinath123@gmail.com','6300044926',3,3,3,'',0.00,0,'Active','',NULL,NULL,0,NULL,NULL),(6,1,'Aruna','Narsing','aruna123@gmail.com','9302561913',2,1,1,'',0.00,0,'Active','',NULL,NULL,0,NULL,NULL),(7,1,'Raji','Patti','raji123@gmail.com','9985638160',3,3,3,'',0.00,0,'Active','',NULL,NULL,0,NULL,NULL),(8,1,'uday','sai','nani123@gmail.com','6543134567',1,4,1,'',0.00,0,'Active','',NULL,NULL,0,NULL,NULL),(9,1,'sai','sree','saisree21@gmail.com','8976543103',2,1,1,'',0.00,0,'Active','',NULL,NULL,0,NULL,NULL),(10,1,'padma','sree','padmasree123@gmail.com','9441036040',1,4,1,'',0.00,0,'Active','',NULL,NULL,0,NULL,NULL);
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
INSERT INTO `superadmins` VALUES (1,'admin@talentsphere.com','AQAAAAIAAYagAAAAEHMMSFx+hyifYbRMOyStIxfTuyhCy42yuMUYI2S57MtW0VazqOuxKXlJjiokJwsIKw==',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'POORNA','SAI','maherishi31@gmail.com','$2a$11$8GN6R9cYO8VxFqz20q9NDOpGrsqac/11.Hnn8d04AMgT4idxVdh0a','HR','8938836472',1,1,'2026-10-22 09:34:19.664710',0,NULL,NULL),(2,1,'Srinivas','Poorna','srinivassree.appsec@gmail.com','$2a$11$ZH5jrqFZmwoyEtbE4dKm5ecIMegLIM8f5s7JeFuwizxuBwnmygqO2','Mentor','8388377636',1,1,'2026-10-22 09:35:33.714715',0,NULL,NULL),(3,1,'Mahesh','s','purnasai99.ps@gmail.com','$2a$11$7Ex53qB0OxfJrEWUYOyUO.IRD2L/I5a4NNfR7Y7jZA/oNjLx/4W96','Mentor','9488577577',1,1,'2026-10-22 09:38:05.085014',0,NULL,NULL),(4,1,'NANI','Poorna','naninarayana891@gmail.com','$2a$11$Q5.IXVfd9S.QVQuD5lUQHeSbInzVMa8OjwR6p/QnBptS.kQrABKsa','Student','8887756567',1,1,'2026-10-22 09:58:32.846407',0,NULL,NULL),(5,1,'Suresh','Gandikota','suresh123@gmail.com','$2a$11$/s4zZiU5gqS.YnU9zc1qYuryGeDk./TZJZmpSXxOMC5/uO6RVCaju','Mentor','9441037604',1,1,'2026-10-22 09:58:42.214735',0,NULL,NULL),(6,1,'Madhu','Kadiviti','madhu123@gmail.com','$2a$11$.8yAsu5.aavwYI6HOn1K0O/2O033mUWaTV/gLsE3kk93iVTb.Njfa','Student','9867452313',1,1,'2026-10-22 10:55:28.149713',0,NULL,NULL),(7,1,'Banu','Sambuturu','banu123@gmail.com','$2a$11$tJyqACLau.dOwsS9kkubmeSXtftlOhm6Got111lGUYZBARFq8WO/W','Student','9347468025',1,1,'2026-10-22 10:55:41.383460',0,NULL,NULL),(8,1,'Sindhu','Patti','sindhu123@gmail.com','$2a$11$j6R6ZQlpApf62NWem.Lroe0BmC/Tz2zoSVQoutcsb9rE7c8tYi62.','Student','9701025076',1,1,'2026-10-22 10:55:53.946345',0,NULL,NULL),(9,1,'Harinath','Patti','harinath123@gmail.com','$2a$11$p6OMLn9qEqjtKQmJGr4atedvuM68RPka0ZPk4ShH7fh1cB0JztM3S','Student','6300044926',1,1,'2026-10-22 10:56:08.412129',0,NULL,NULL),(10,1,'Aruna','Narsing','aruna123@gmail.com','$2a$11$0xeGQvaZeHsgIDg6t5wMl.JPFvI3A8gUKGFL9gSoxHJbUi/SJ4WXq','Student','9302561913',1,1,'2026-10-22 10:56:19.576530',0,NULL,NULL),(11,1,'Raji','Patti','raji123@gmail.com','$2a$11$nTZ1HEGEd7GOPLWebbu0ZeNh86q37AqfkX5F9H4UYAXZnGCvLLoz2','Student','9985638160',1,1,'2026-10-22 10:56:30.496445',0,NULL,NULL),(12,1,'uday','sai','nani123@gmail.com','$2a$11$Za2mV5ZUbmsa9X57EVkj4eGO.b51bArNwCG9jKH.hkqK/dBEyGIQi','Student','6543134567',1,1,'2026-10-23 11:16:03.310613',0,NULL,NULL),(13,1,'sai','sree','saisree21@gmail.com','$2a$11$r1Gd0DUxAjQbJ8I3RYp2XeI1728fuzuj5lyN1s0wMGdEgtGyc961K','Student','8976543103',1,1,'2026-10-25 12:03:00.336730',0,NULL,NULL),(14,1,'padma','sree','padmasree123@gmail.com','$2a$11$a47lulBK8wCarh5PtxDW5ORhwSKy2IHN.XPUoxTXid7zPKRS/bApu','Student','9441036040',1,1,'2026-10-26 05:44:08.468625',0,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'talentspheredb'
--

--
-- Dumping routines for database 'talentspheredb'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-26 14:58:45
