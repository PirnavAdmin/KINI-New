using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Chat;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services.Tenancy;
using TalentSphereAPI.SignalR;

namespace TalentSphereAPI.Services
{
    public class ChatService : IChatService
    {
        private readonly ApplicationDbContext _context;
        private readonly ITenantContext _tenantContext;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly IWebHostEnvironment _environment;
        private readonly INotificationService _notificationService;

        private const long MaxFileSize = 10 * 1024 * 1024;

        private static readonly Dictionary<string, string> AllowedFiles =
            new(StringComparer.OrdinalIgnoreCase)
            {
                [".pdf"] = "application/pdf",

                [".doc"] = "application/msword",
                [".docx"] =
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

                [".xls"] = "application/vnd.ms-excel",
                [".xlsx"] =
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

                [".ppt"] = "application/vnd.ms-powerpoint",
                [".pptx"] =
                    "application/vnd.openxmlformats-officedocument.presentationml.presentation",

                [".txt"] = "text/plain",

                [".png"] = "image/png",
                [".jpg"] = "image/jpeg",
                [".jpeg"] = "image/jpeg",
                [".webp"] = "image/webp",

                [".zip"] = "application/zip"
            };

        public ChatService(
    ApplicationDbContext context,
    ITenantContext tenantContext,
    IHttpContextAccessor httpContextAccessor,
    IHubContext<ChatHub> hubContext,
    INotificationService notificationService,
    IWebHostEnvironment environment)
        {
            _context = context;
            _tenantContext = tenantContext;
            _httpContextAccessor = httpContextAccessor;
            _hubContext = hubContext;
            _notificationService = notificationService;
            _environment = environment;
        }

        private int OrganizationId =>
            _tenantContext.OrganizationId;

        private ClaimsPrincipal CurrentUser =>
            _httpContextAccessor.HttpContext?.User
            ?? throw new UnauthorizedAccessException(
                "User is not authenticated.");

        private string CurrentRole =>
            CurrentUser.FindFirst(ClaimTypes.Role)?.Value
            ?? string.Empty;

        // =========================================================
        // CREATE CONVERSATION
        // =========================================================

        public async Task<ChatConversationDto>
            CreateConversationAsync(
                CreateConversationDto dto)
        {
            if (dto == null)
                throw new ArgumentException(
                    "Request body is required.");

            var role = CurrentRole;

            int mentorId;
            int studentId;

            if (role.Equals(
                    "Mentor",
                    StringComparison.OrdinalIgnoreCase))
            {
                if (!dto.StudentId.HasValue ||
                    dto.StudentId.Value <= 0)
                {
                    throw new ArgumentException(
                        "StudentId is required.");
                }

                mentorId =
                    await GetCurrentMentorIdAsync();

                studentId =
                    dto.StudentId.Value;

                await ValidateMentorStudentRelationshipAsync(
                    mentorId,
                    studentId);
            }
            else if (role.Equals(
                         "Student",
                         StringComparison.OrdinalIgnoreCase))
            {
                studentId =
                    await GetCurrentStudentIdAsync();

                if (!dto.MentorId.HasValue ||
                    dto.MentorId.Value <= 0)
                {
                    throw new ArgumentException(
                        "MentorId is required.");
                }

                mentorId =
                    dto.MentorId.Value;

                await ValidateMentorStudentRelationshipAsync(
                    mentorId,
                    studentId);
            }
            else
            {
                throw new UnauthorizedAccessException(
                    "Only Mentor and Student users can use chat.");
            }

            var conversation =
                await _context.ChatConversations
                    .FirstOrDefaultAsync(x =>
                        x.OrganizationId == OrganizationId &&
                        x.MentorId == mentorId &&
                        x.StudentId == studentId &&
                        x.IsActive);

            if (conversation == null)
            {
                conversation =
                    new ChatConversation
                    {
                        OrganizationId = OrganizationId,
                        MentorId = mentorId,
                        StudentId = studentId,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    };

                _context.ChatConversations.Add(
                    conversation);

                await _context.SaveChangesAsync();
            }

            return await BuildConversationDtoAsync(
                conversation.ConversationId);
        }

        // =========================================================
        // GET CONVERSATIONS
        // =========================================================

        public async Task<List<ChatConversationDto>>
            GetConversationsAsync()
        {
            var role = CurrentRole;

            IQueryable<ChatConversation> query =
                _context.ChatConversations
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId == OrganizationId &&
                        x.IsActive);

            if (role.Equals(
                    "Mentor",
                    StringComparison.OrdinalIgnoreCase))
            {
                var mentorId =
                    await GetCurrentMentorIdAsync();

                query =
                    query.Where(x =>
                        x.MentorId == mentorId);
            }
            else if (role.Equals(
                         "Student",
                         StringComparison.OrdinalIgnoreCase))
            {
                var studentId =
                    await GetCurrentStudentIdAsync();

                query =
                    query.Where(x =>
                        x.StudentId == studentId);
            }
            else
            {
                throw new UnauthorizedAccessException(
                    "Only Mentor and Student users can use chat.");
            }

            var conversations =
                await query
                    .Include(x => x.Mentor)
                    .Include(x => x.Student)
                    .Include(x => x.Messages)
                    .OrderByDescending(x =>
                        x.LastMessageAt ?? x.CreatedAt)
                    .ToListAsync();

            var result =
                new List<ChatConversationDto>();

            foreach (var conversation in conversations)
            {
                var lastMessage =
                    conversation.Messages
                        .OrderByDescending(x => x.SentAt)
                        .FirstOrDefault();

                var unreadCount =
                    await GetUnreadCountAsync(
                        conversation,
                        role);

                result.Add(
                    new ChatConversationDto
                    {
                        ConversationId =
                            conversation.ConversationId,

                        Mentor =
                            new ChatParticipantDto
                            {
                                Id =
                                    conversation.Mentor.MentorId,

                                Name =
                                    $"{conversation.Mentor.FirstName} {conversation.Mentor.LastName}"
                                        .Trim(),

                                Email =
                                    conversation.Mentor.Email,

                                Role = "Mentor"
                            },

                        Student =
                            new ChatParticipantDto
                            {
                                Id =
                                    conversation.Student.StudentId,

                                Name =
                                    $"{conversation.Student.FirstName} {conversation.Student.LastName}"
                                        .Trim(),

                                Email =
                                    conversation.Student.Email,

                                Role = "Student"
                            },

                        LastMessage =
                            lastMessage?.Message,

                        LastMessageAt =
                            lastMessage?.SentAt,

                        UnreadCount =
                            unreadCount,

                        CreatedAt =
                            conversation.CreatedAt
                    });
            }

            return result;
        }

        // =========================================================
        // GET MESSAGES
        // =========================================================

        public async Task<List<ChatMessageDto>>
            GetMessagesAsync(
                int conversationId,
                int page = 1,
                int pageSize = 50)
        {
            if (page <= 0)
                page = 1;

            if (pageSize <= 0)
                pageSize = 50;

            if (pageSize > 100)
                pageSize = 100;

            var conversation =
                await GetAuthorizedConversationAsync(
                    conversationId);

            var messages =
                await _context.ChatMessages
                    .AsNoTracking()
                    .Include(x => x.Attachment)
                    .Where(x =>
                        x.ConversationId ==
                        conversation.ConversationId)
                    .OrderByDescending(x => x.SentAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .OrderBy(x => x.SentAt)
                    .ToListAsync();

            return messages
                .Select(ToMessageDto)
                .ToList();
        }

        // =========================================================
        // SEND MESSAGE
        // =========================================================

        public async Task<ChatMessageDto>
    SendMessageAsync(
        int conversationId,
        SendMessageDto dto)
        {
            if (dto == null)
            {
                throw new ArgumentException(
                    "Request body is required.");
            }

            var messageText =
                dto.Message?.Trim() ?? string.Empty;

            if (messageText.Length > 5000)
            {
                throw new ArgumentException(
                    "Message cannot exceed 5000 characters.");
            }

            if (string.IsNullOrWhiteSpace(messageText) &&
                !dto.AttachmentId.HasValue)
            {
                throw new ArgumentException(
                    "Message or attachment is required.");
            }

            var conversation =
                await GetAuthorizedConversationAsync(
                    conversationId);

            var role =
                CurrentRole;

            string senderType;
            int senderId;
            int recipientId;

            // =========================================================
            // IDENTIFY SENDER + RECIPIENT
            // =========================================================

            if (role.Equals(
                    "Mentor",
                    StringComparison.OrdinalIgnoreCase))
            {
                senderType = "Mentor";

                senderId =
                    await GetCurrentMentorIdAsync();

                if (senderId != conversation.MentorId)
                {
                    throw new UnauthorizedAccessException(
                        "You are not a participant in this conversation.");
                }

                // Mentor -> Student
                recipientId =
                    conversation.StudentId;
            }
            else if (role.Equals(
                         "Student",
                         StringComparison.OrdinalIgnoreCase))
            {
                senderType = "Student";

                senderId =
                    await GetCurrentStudentIdAsync();

                if (senderId != conversation.StudentId)
                {
                    throw new UnauthorizedAccessException(
                        "You are not a participant in this conversation.");
                }

                // Student -> Mentor
                recipientId =
                    conversation.MentorId;
            }
            else
            {
                throw new UnauthorizedAccessException(
                    "Only Mentor and Student users can send messages.");
            }

            // =========================================================
            // ATTACHMENT
            // =========================================================

            ChatAttachment? attachment = null;

            if (dto.AttachmentId.HasValue)
            {
                attachment =
                    await _context.ChatAttachments
                        .FirstOrDefaultAsync(x =>
                            x.AttachmentId ==
                                dto.AttachmentId.Value &&
                            x.ConversationId ==
                                conversationId &&
                            !x.IsDeleted);

                if (attachment == null)
                {
                    throw new KeyNotFoundException(
                        "Attachment not found.");
                }

                if (attachment.UploadedBy != senderId ||
                    !attachment.UploadedByType.Equals(
                        senderType,
                        StringComparison.OrdinalIgnoreCase))
                {
                    throw new UnauthorizedAccessException(
                        "You cannot attach this file.");
                }

                if (attachment.MessageId.HasValue)
                {
                    throw new ArgumentException(
                        "This attachment is already attached to a message.");
                }
            }

            // =========================================================
            // CREATE MESSAGE
            // =========================================================

            var message =
                new ChatMessage
                {
                    ConversationId =
                        conversation.ConversationId,

                    SenderType =
                        senderType,

                    SenderId =
                        senderId,

                    Message =
                        messageText,

                    SentAt =
                        DateTime.UtcNow,

                    IsRead = false,

                    AttachmentId =
                        attachment?.AttachmentId
                };

            _context.ChatMessages.Add(message);

            conversation.LastMessageAt =
                message.SentAt;

            await _context.SaveChangesAsync();

            // =========================================================
            // BUILD MESSAGE DTO
            // =========================================================

            var messageDto =
                await BuildMessageDtoAsync(
                    message.MessageId);

            // =========================================================
            // REAL-TIME CHAT MESSAGE
            // =========================================================

            await _hubContext.Clients
                .Group(
                    ChatHub.GetConversationGroup(
                        conversation.ConversationId))
                .SendAsync(
                    "ReceiveMessage",
                    messageDto);

            // =========================================================
            // GET SENDER NAME
            // =========================================================

            string senderName;

            if (senderType.Equals(
                    "Mentor",
                    StringComparison.OrdinalIgnoreCase))
            {
                var mentor =
                    await _context.Mentors
                        .AsNoTracking()
                        .FirstOrDefaultAsync(x =>
                            x.MentorId == senderId &&
                            x.OrganizationId ==
                                OrganizationId &&
                            !x.IsDeleted);

                senderName =
                    mentor == null
                        ? "Mentor"
                        : $"{mentor.FirstName} {mentor.LastName}"
                            .Trim();
            }
            else
            {
                var student =
                    await _context.Students
                        .AsNoTracking()
                        .FirstOrDefaultAsync(x =>
                            x.StudentId == senderId &&
                            x.OrganizationId ==
                                OrganizationId &&
                            !x.IsDeleted);

                senderName =
                    student == null
                        ? "Student"
                        : $"{student.FirstName} {student.LastName}"
                            .Trim();
            }

            // =========================================================
            // CHAT NOTIFICATION
            // =========================================================

            await _notificationService
                .NotifyChatMessageAsync(
                    conversationId:
                        conversation.ConversationId,

                    senderId:
                        senderId,

                    senderType:
                        senderType,

                    recipientId:
                        recipientId,

                    senderName:
                        senderName,

                    message:
                        string.IsNullOrWhiteSpace(messageText)
                            ? "Attachment"
                            : messageText);

            return messageDto;
        }

        // =========================================================
        // UPLOAD ATTACHMENT
        // =========================================================

        public async Task<ChatAttachmentDto>
            UploadAttachmentAsync(
                int conversationId,
                IFormFile file,
                string? message)
        {
            if (file == null ||
                file.Length == 0)
            {
                throw new ArgumentException(
                    "File is required.");
            }

            if (file.Length > MaxFileSize)
            {
                throw new ChatFileTooLargeException(
                    "File size cannot exceed 10 MB.");
            }

            var conversation =
                await GetAuthorizedConversationAsync(
                    conversationId);

            var role =
                CurrentRole;

            int uploaderId;

            if (role.Equals(
                    "Mentor",
                    StringComparison.OrdinalIgnoreCase))
            {
                uploaderId =
                    await GetCurrentMentorIdAsync();
            }
            else if (role.Equals(
                         "Student",
                         StringComparison.OrdinalIgnoreCase))
            {
                uploaderId =
                    await GetCurrentStudentIdAsync();
            }
            else
            {
                throw new UnauthorizedAccessException(
                    "Only Mentor and Student users can upload attachments.");
            }

            var extension =
                Path.GetExtension(
                    file.FileName);

            if (string.IsNullOrWhiteSpace(extension))
            {
                throw new ChatUnsupportedFileException(
                    "File extension is required.");
            }

            extension =
                extension.ToLowerInvariant();

            if (!AllowedFiles.ContainsKey(extension))
            {
                throw new ChatUnsupportedFileException(
                    "This file type is not supported.");
            }

            var expectedMime =
                AllowedFiles[extension];

            if (!string.IsNullOrWhiteSpace(file.ContentType) &&
                !file.ContentType.Equals(
                    expectedMime,
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new ChatUnsupportedFileException(
                    "The uploaded file MIME type is not supported.");
            }

            var safeOriginalName =
                Path.GetFileName(
                    file.FileName);

            if (safeOriginalName.Length > 255)
            {
                safeOriginalName =
                    safeOriginalName[..255];
            }

            var storedFileName =
                $"{Guid.NewGuid():N}{extension}";

            var root =
                _environment.ContentRootPath;

            var storageDirectory =
                Path.Combine(
                    root,
                    "App_Data",
                    "ChatAttachments");

            Directory.CreateDirectory(
                storageDirectory);

            var physicalPath =
                Path.Combine(
                    storageDirectory,
                    storedFileName);

            await using (var stream =
                         new FileStream(
                             physicalPath,
                             FileMode.CreateNew,
                             FileAccess.Write,
                             FileShare.None))
            {
                await file.CopyToAsync(stream);
            }

            var attachment =
                new ChatAttachment
                {
                    ConversationId =
                        conversation.ConversationId,

                    OriginalFileName =
                        safeOriginalName,

                    StoredFileName =
                        storedFileName,

                    FileType =
                        expectedMime,

                    FileSize =
                        file.Length,

                    StoragePath =
                        Path.Combine(
                            "App_Data",
                            "ChatAttachments",
                            storedFileName),

                    UploadedBy =
                        uploaderId,

                    UploadedByType =
                        role,

                    UploadedAt =
                        DateTime.UtcNow,

                    IsDeleted =
                        false
                };

            _context.ChatAttachments.Add(
                attachment);

            await _context.SaveChangesAsync();

            return ToAttachmentDto(
                attachment);
        }

        // =========================================================
        // DOWNLOAD
        // =========================================================

        public async Task<(
            byte[] FileBytes,
            string ContentType,
            string FileName)>
            DownloadAttachmentAsync(
                int attachmentId)
        {
            var attachment =
                await GetAuthorizedAttachmentAsync(
                    attachmentId);

            var path =
                GetPhysicalAttachmentPath(
                    attachment);

            if (!File.Exists(path))
            {
                throw new KeyNotFoundException(
                    "Attachment file was not found.");
            }

            var bytes =
                await File.ReadAllBytesAsync(path);

            return (
                bytes,
                attachment.FileType,
                attachment.OriginalFileName);
        }

        // =========================================================
        // VIEW
        // =========================================================

        public async Task<(
            byte[] FileBytes,
            string ContentType,
            string FileName)>
            ViewAttachmentAsync(
                int attachmentId)
        {
            var attachment =
                await GetAuthorizedAttachmentAsync(
                    attachmentId);

            var inlineTypes =
                new[]
                {
                    "application/pdf",
                    "image/png",
                    "image/jpeg",
                    "image/webp"
                };

            if (!inlineTypes.Contains(
                    attachment.FileType,
                    StringComparer.OrdinalIgnoreCase))
            {
                throw new ChatUnsupportedFileException(
                    "This file type does not support inline preview.");
            }

            var path =
                GetPhysicalAttachmentPath(
                    attachment);

            if (!File.Exists(path))
            {
                throw new KeyNotFoundException(
                    "Attachment file was not found.");
            }

            var bytes =
                await File.ReadAllBytesAsync(path);

            return (
                bytes,
                attachment.FileType,
                attachment.OriginalFileName);
        }

        // =========================================================
        // DELETE ATTACHMENT
        // =========================================================

        public async Task DeleteAttachmentAsync(
            int attachmentId)
        {
            var attachment =
                await GetAuthorizedAttachmentAsync(
                    attachmentId);

            var role =
                CurrentRole;

            int currentUserId;

            if (role.Equals(
                    "Mentor",
                    StringComparison.OrdinalIgnoreCase))
            {
                currentUserId =
                    await GetCurrentMentorIdAsync();
            }
            else if (role.Equals(
                         "Student",
                         StringComparison.OrdinalIgnoreCase))
            {
                currentUserId =
                    await GetCurrentStudentIdAsync();
            }
            else
            {
                throw new UnauthorizedAccessException();
            }

            if (attachment.UploadedBy != currentUserId ||
                !attachment.UploadedByType.Equals(
                    role,
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException(
                    "Only the uploader can delete this attachment.");
            }

            attachment.IsDeleted = true;

            await _context.SaveChangesAsync();

            var path =
                GetPhysicalAttachmentPath(
                    attachment);

            if (File.Exists(path))
            {
                File.Delete(path);
            }
        }

        // =========================================================
        // MARK AS READ
        // =========================================================

        public async Task MarkAsReadAsync(
            int conversationId)
        {
            var conversation =
                await GetAuthorizedConversationAsync(
                    conversationId);

            var role =
                CurrentRole;

            string recipientSenderType;

            if (role.Equals(
                    "Mentor",
                    StringComparison.OrdinalIgnoreCase))
            {
                recipientSenderType = "Mentor";
            }
            else if (role.Equals(
                         "Student",
                         StringComparison.OrdinalIgnoreCase))
            {
                recipientSenderType = "Student";
            }
            else
            {
                throw new UnauthorizedAccessException(
                    "Only Mentor and Student users can use chat.");
            }

            var messages =
                await _context.ChatMessages
                    .Where(x =>
                        x.ConversationId ==
                        conversation.ConversationId &&
                        !x.IsRead &&
                        x.SenderType !=
                        recipientSenderType)
                    .ToListAsync();

            if (messages.Count == 0)
                return;

            var now =
                DateTime.UtcNow;

            foreach (var message in messages)
            {
                message.IsRead = true;
                message.ReadAt = now;
            }

            await _context.SaveChangesAsync();

            await _hubContext.Clients
                .Group(
                    ChatHub.GetConversationGroup(
                        conversationId))
                .SendAsync(
                    "MessagesRead",
                    conversationId);
        }

        // =========================================================
        // AUTHORIZED ATTACHMENT
        // =========================================================

        private async Task<ChatAttachment>
            GetAuthorizedAttachmentAsync(
                int attachmentId)
        {
            var attachment =
                await _context.ChatAttachments
                    .Include(x => x.Conversation)
                    .FirstOrDefaultAsync(x =>
                        x.AttachmentId ==
                        attachmentId &&
                        !x.IsDeleted &&
                        x.Conversation.OrganizationId ==
                        OrganizationId &&
                        x.Conversation.IsActive);

            if (attachment == null)
            {
                throw new KeyNotFoundException(
                    "Attachment not found.");
            }

            // This performs the actual Mentor/Student
            // conversation membership authorization.
            await GetAuthorizedConversationAsync(
                attachment.ConversationId);

            return attachment;
        }

        // =========================================================
        // PHYSICAL PATH
        // =========================================================

        private string GetPhysicalAttachmentPath(
            ChatAttachment attachment)
        {
            var root =
                _environment.ContentRootPath;

            var storageRoot =
                Path.GetFullPath(
                    Path.Combine(
                        root,
                        "App_Data",
                        "ChatAttachments"));

            var fullPath =
                Path.GetFullPath(
                    Path.Combine(
                        root,
                        attachment.StoragePath));

            if (!fullPath.StartsWith(
                    storageRoot,
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException(
                    "Invalid attachment path.");
            }

            return fullPath;
        }

        // =========================================================
        // CURRENT MENTOR
        // =========================================================

        private async Task<int>
            GetCurrentMentorIdAsync()
        {
            var userIdText =
                CurrentUser
                    .FindFirst(
                        ClaimTypes.NameIdentifier)
                    ?.Value;

            if (!int.TryParse(
                    userIdText,
                    out var userId))
            {
                throw new UnauthorizedAccessException(
                    "UserId was not found in the token.");
            }

            var mentorRecord =
                await (
                    from mentor in _context.Mentors

                    join employee in _context.Employees
                        on mentor.EmployeeId
                        equals employee.EmployeeId

                    where employee.UserId == userId &&
                          mentor.OrganizationId ==
                              OrganizationId &&
                          employee.OrganizationId ==
                              OrganizationId &&
                          !mentor.IsDeleted &&
                          !employee.IsDeleted

                    select mentor
                )
                .FirstOrDefaultAsync();

            if (mentorRecord == null)
            {
                throw new UnauthorizedAccessException(
                    "The authenticated user is not linked to a mentor.");
            }

            return mentorRecord.MentorId;
        }

        // =========================================================
        // CURRENT STUDENT
        // =========================================================

        private async Task<int>
            GetCurrentStudentIdAsync()
        {
            var studentIdText =
                CurrentUser
                    .FindFirst("StudentId")
                    ?.Value;

            if (int.TryParse(
                    studentIdText,
                    out var studentId) &&
                studentId > 0)
            {
                var student =
                    await _context.Students
                        .AsNoTracking()
                        .FirstOrDefaultAsync(x =>
                            x.StudentId == studentId &&
                            x.OrganizationId ==
                                OrganizationId &&
                            !x.IsDeleted);

                if (student != null)
                    return student.StudentId;
            }

            var nameIdentifier =
                CurrentUser
                    .FindFirst(
                        ClaimTypes.NameIdentifier)
                    ?.Value;

            if (int.TryParse(
                    nameIdentifier,
                    out var identifier))
            {
                var student =
                    await _context.Students
                        .AsNoTracking()
                        .FirstOrDefaultAsync(x =>
                            x.StudentId == identifier &&
                            x.OrganizationId ==
                                OrganizationId &&
                            !x.IsDeleted);

                if (student != null)
                    return student.StudentId;
            }

            throw new UnauthorizedAccessException(
                "StudentId was not found in the authenticated token.");
        }

        // =========================================================
        // RELATIONSHIP
        // =========================================================

        private async Task
            ValidateMentorStudentRelationshipAsync(
                int mentorId,
                int studentId)
        {
            var valid =
                await _context.Students
                    .AsNoTracking()
                    .AnyAsync(x =>
                        x.StudentId == studentId &&
                        x.MentorId == mentorId &&
                        x.OrganizationId ==
                            OrganizationId &&
                        !x.IsDeleted);

            if (!valid)
            {
                throw new UnauthorizedAccessException(
                    "This student is not assigned to this mentor.");
            }

            var mentorExists =
                await _context.Mentors
                    .AsNoTracking()
                    .AnyAsync(x =>
                        x.MentorId == mentorId &&
                        x.OrganizationId ==
                            OrganizationId &&
                        !x.IsDeleted);

            if (!mentorExists)
            {
                throw new UnauthorizedAccessException(
                    "Mentor not found.");
            }
        }

        // =========================================================
        // AUTHORIZED CONVERSATION
        // =========================================================

        private async Task<ChatConversation>
            GetAuthorizedConversationAsync(
                int conversationId)
        {
            var conversation =
                await _context.ChatConversations
                    .FirstOrDefaultAsync(x =>
                        x.ConversationId ==
                            conversationId &&
                        x.OrganizationId ==
                            OrganizationId &&
                        x.IsActive);

            if (conversation == null)
            {
                throw new KeyNotFoundException(
                    "Conversation not found.");
            }

            var role =
                CurrentRole;

            if (role.Equals(
                    "Mentor",
                    StringComparison.OrdinalIgnoreCase))
            {
                var mentorId =
                    await GetCurrentMentorIdAsync();

                if (conversation.MentorId != mentorId)
                {
                    throw new UnauthorizedAccessException(
                        "You do not have access to this conversation.");
                }
            }
            else if (role.Equals(
                         "Student",
                         StringComparison.OrdinalIgnoreCase))
            {
                var studentId =
                    await GetCurrentStudentIdAsync();

                if (conversation.StudentId != studentId)
                {
                    throw new UnauthorizedAccessException(
                        "You do not have access to this conversation.");
                }
            }
            else
            {
                throw new UnauthorizedAccessException(
                    "Only Mentor and Student users can access chat.");
            }

            return conversation;
        }

        // =========================================================
        // UNREAD COUNT
        // =========================================================

        private async Task<int>
            GetUnreadCountAsync(
                ChatConversation conversation,
                string role)
        {
            var senderType =
                role.Equals(
                    "Mentor",
                    StringComparison.OrdinalIgnoreCase)
                    ? "Mentor"
                    : "Student";

            return await _context.ChatMessages
                .CountAsync(x =>
                    x.ConversationId ==
                        conversation.ConversationId &&
                    !x.IsRead &&
                    x.SenderType != senderType);
        }

        // =========================================================
        // BUILD CONVERSATION DTO
        // =========================================================

        private async Task<ChatConversationDto>
            BuildConversationDtoAsync(
                int conversationId)
        {
            var conversation =
                await _context.ChatConversations
                    .AsNoTracking()
                    .Include(x => x.Mentor)
                    .Include(x => x.Student)
                    .Include(x => x.Messages)
                    .FirstOrDefaultAsync(x =>
                        x.ConversationId ==
                            conversationId &&
                        x.OrganizationId ==
                            OrganizationId);

            if (conversation == null)
            {
                throw new KeyNotFoundException(
                    "Conversation not found.");
            }

            var role =
                CurrentRole;

            var lastMessage =
                conversation.Messages
                    .OrderByDescending(x => x.SentAt)
                    .FirstOrDefault();

            var unreadCount =
                await GetUnreadCountAsync(
                    conversation,
                    role);

            return new ChatConversationDto
            {
                ConversationId =
                    conversation.ConversationId,

                Mentor =
                    new ChatParticipantDto
                    {
                        Id =
                            conversation.Mentor.MentorId,

                        Name =
                            $"{conversation.Mentor.FirstName} {conversation.Mentor.LastName}"
                                .Trim(),

                        Email =
                            conversation.Mentor.Email,

                        Role = "Mentor"
                    },

                Student =
                    new ChatParticipantDto
                    {
                        Id =
                            conversation.Student.StudentId,

                        Name =
                            $"{conversation.Student.FirstName} {conversation.Student.LastName}"
                                .Trim(),

                        Email =
                            conversation.Student.Email,

                        Role = "Student"
                    },

                LastMessage =
                    lastMessage?.Message,

                LastMessageAt =
                    lastMessage?.SentAt,

                UnreadCount =
                    unreadCount,

                CreatedAt =
                    conversation.CreatedAt
            };
        }

        // =========================================================
        // BUILD MESSAGE DTO
        // =========================================================

        private async Task<ChatMessageDto>
            BuildMessageDtoAsync(
                int messageId)
        {
            var message =
                await _context.ChatMessages
                    .AsNoTracking()
                    .Include(x => x.Attachment)
                    .FirstAsync(x =>
                        x.MessageId ==
                        messageId);

            return ToMessageDto(message);
        }

        private ChatMessageDto
            ToMessageDto(
                ChatMessage message)
        {
            return new ChatMessageDto
            {
                MessageId =
                    message.MessageId,

                ConversationId =
                    message.ConversationId,

                SenderType =
                    message.SenderType,

                SenderId =
                    message.SenderId,

                Message =
                    message.Message,

                SentAt =
                    message.SentAt,

                IsRead =
                    message.IsRead,

                ReadAt =
                    message.ReadAt,

                Attachment =
                    message.Attachment == null
                        ? null
                        : ToAttachmentDto(
                            message.Attachment)
            };
        }

        private ChatAttachmentDto
            ToAttachmentDto(
                ChatAttachment attachment)
        {
            return new ChatAttachmentDto
            {
                AttachmentId =
                    attachment.AttachmentId,

                ConversationId =
                    attachment.ConversationId,

                MessageId =
                    attachment.MessageId,

                OriginalFileName =
                    attachment.OriginalFileName,

                FileName =
                    attachment.OriginalFileName,

                FileType =
                    attachment.FileType,

                FileSize =
                    attachment.FileSize,

                DownloadUrl =
                    $"/api/v1/chat/attachments/{attachment.AttachmentId}/download",

                ViewUrl =
                    $"/api/v1/chat/attachments/{attachment.AttachmentId}/view",

                UploadedBy =
                    attachment.UploadedBy,

                UploadedByType =
                    attachment.UploadedByType,

                UploadedAt =
                    attachment.UploadedAt
            };
        }
    }

    // =============================================================
    // CUSTOM EXCEPTIONS
    // =============================================================

    public class ChatFileTooLargeException
        : Exception
    {
        public ChatFileTooLargeException(
            string message)
            : base(message)
        {
        }
    }

    public class ChatUnsupportedFileException
        : Exception
    {
        public ChatUnsupportedFileException(
            string message)
            : base(message)
        {
        }
    }
}