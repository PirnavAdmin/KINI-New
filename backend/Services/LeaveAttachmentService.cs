using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Services
{
    public sealed class LeaveAttachmentException : Exception
    {
        public LeaveAttachmentException(int statusCode, string code, string message) : base(message)
        {
            StatusCode = statusCode;
            Code = code;
        }

        public int StatusCode { get; }
        public string Code { get; }
    }

    public interface ILeaveAttachmentService
    {
        Task<LeaveAttachmentDto> UploadAsync(ClaimsPrincipal user, int leaveId, IFormFile? file, CancellationToken ct = default);
        Task<List<LeaveAttachmentDto>> ListAsync(ClaimsPrincipal user, int leaveId, CancellationToken ct = default);
        Task<(Stream Content, string ContentType, string FileName)> OpenAsync(ClaimsPrincipal user, int attachmentId, CancellationToken ct = default);
    }

    /// <summary>
    /// Supporting documents for leave requests (both /api/hr/leave and
    /// /api/v1/leave-requests use the same LeaveRequests rows).
    /// Access: the employee who owns the leave, or users with the
    /// "Leave Management" permission (view to read, edit to upload).
    /// </summary>
    public class LeaveAttachmentService : ILeaveAttachmentService
    {
        public const long MaxBytes = 5 * 1024 * 1024;
        public const int MaxPerLeave = 5;
        private const string StorageCategory = "leaveattachments";

        private readonly ApplicationDbContext _context;
        private readonly ITenantContext _tenant;
        private readonly IPrivateFileStorage _storage;
        private readonly IAuthorizationService _authorization;

        public LeaveAttachmentService(
            ApplicationDbContext context,
            ITenantContext tenant,
            IPrivateFileStorage storage,
            IAuthorizationService authorization)
        {
            _context = context;
            _tenant = tenant;
            _storage = storage;
            _authorization = authorization;
        }

        public async Task<LeaveAttachmentDto> UploadAsync(ClaimsPrincipal user, int leaveId, IFormFile? file, CancellationToken ct = default)
        {
            var (leave, isOwner) = await LoadLeaveAsync(user, leaveId, ct);
            if (!isOwner && !await HasPermissionAsync(user, "edit"))
                throw NotFound();

            if (leave.Status != LeaveRequestStatus.Pending)
                throw new LeaveAttachmentException(409, "LEAVE_NOT_PENDING",
                    "Documents can only be added while the leave request is pending.");

            var count = await _context.LeaveRequestAttachments
                .CountAsync(a => a.LeaveRequestId == leave.LeaveRequestId && a.OrganizationId == leave.OrganizationId, ct);
            if (count >= MaxPerLeave)
                throw new LeaveAttachmentException(409, "TOO_MANY_ATTACHMENTS",
                    $"A leave request can have at most {MaxPerLeave} documents.");

            if (file == null)
                throw new LeaveAttachmentException(400, "VALIDATION_ERROR", "Please choose a file to upload.");

            var (stored, error) = await _storage.SaveDocumentAsync(file, StorageCategory, leave.OrganizationId, MaxBytes, ct);
            if (stored == null)
                throw new LeaveAttachmentException(400, "VALIDATION_ERROR", error ?? "The file could not be saved.");

            var attachment = new LeaveRequestAttachment
            {
                LeaveRequestId = leave.LeaveRequestId,
                OrganizationId = leave.OrganizationId,
                UploadedByUserId = UserId(user),
                OriginalFileName = SafeFileName(file.FileName, stored.ContentType),
                ContentType = stored.ContentType,
                SizeBytes = stored.SizeBytes,
                Sha256 = stored.Sha256,
                StoragePath = stored.StoragePath,
                UploadedAt = DateTime.UtcNow
            };
            _context.LeaveRequestAttachments.Add(attachment);

            try
            {
                await _context.SaveChangesAsync(ct);
            }
            catch
            {
                _storage.TryDelete(stored.StoragePath); // no orphan file without a row
                throw;
            }

            return ToDto(attachment);
        }

        public async Task<List<LeaveAttachmentDto>> ListAsync(ClaimsPrincipal user, int leaveId, CancellationToken ct = default)
        {
            var (leave, isOwner) = await LoadLeaveAsync(user, leaveId, ct);
            if (!isOwner && !await HasPermissionAsync(user, "view"))
                throw NotFound();

            return await ForLeaveAsync(_context, leave.OrganizationId, leave.LeaveRequestId, ct);
        }

        public async Task<(Stream Content, string ContentType, string FileName)> OpenAsync(ClaimsPrincipal user, int attachmentId, CancellationToken ct = default)
        {
            var organizationId = _tenant.OrganizationId;
            var attachment = await _context.LeaveRequestAttachments
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.LeaveRequestAttachmentId == attachmentId && a.OrganizationId == organizationId, ct)
                ?? throw NotFound("ATTACHMENT_NOT_FOUND", "Document not found.");

            var (_, isOwner) = await LoadLeaveAsync(user, attachment.LeaveRequestId, ct);
            if (!isOwner && !await HasPermissionAsync(user, "view"))
                throw NotFound("ATTACHMENT_NOT_FOUND", "Document not found.");

            var stream = _storage.OpenRead(attachment.StoragePath)
                ?? throw NotFound("ATTACHMENT_FILE_MISSING", "The document file is no longer available.");

            return (stream, attachment.ContentType, attachment.OriginalFileName);
        }

        /// <summary>Attachment list for a leave already known to be in this organization (used by HR leave details).</summary>
        public static Task<List<LeaveAttachmentDto>> ForLeaveAsync(
            ApplicationDbContext context, int organizationId, int leaveId, CancellationToken ct = default) =>
            context.LeaveRequestAttachments
                .AsNoTracking()
                .Where(a => a.LeaveRequestId == leaveId && a.OrganizationId == organizationId)
                .OrderBy(a => a.UploadedAt)
                .Select(a => new LeaveAttachmentDto
                {
                    AttachmentId = a.LeaveRequestAttachmentId,
                    LeaveId = a.LeaveRequestId,
                    FileName = a.OriginalFileName,
                    ContentType = a.ContentType,
                    FileSize = a.SizeBytes,
                    UploadedAt = a.UploadedAt,
                    ViewUrl = "/api/hr/leave/attachments/" + a.LeaveRequestAttachmentId + "/view",
                    DownloadUrl = "/api/hr/leave/attachments/" + a.LeaveRequestAttachmentId + "/download"
                })
                .ToListAsync(ct);

        private static LeaveAttachmentDto ToDto(LeaveRequestAttachment a) => new()
        {
            AttachmentId = a.LeaveRequestAttachmentId,
            LeaveId = a.LeaveRequestId,
            FileName = a.OriginalFileName,
            ContentType = a.ContentType,
            FileSize = a.SizeBytes,
            UploadedAt = a.UploadedAt,
            ViewUrl = $"/api/hr/leave/attachments/{a.LeaveRequestAttachmentId}/view",
            DownloadUrl = $"/api/hr/leave/attachments/{a.LeaveRequestAttachmentId}/download"
        };

        // Leave in the caller's organization, plus whether the caller is the employee who applied.
        private async Task<(LeaveRequest Leave, bool IsOwner)> LoadLeaveAsync(ClaimsPrincipal user, int leaveId, CancellationToken ct)
        {
            var organizationId = _tenant.OrganizationId;
            var leave = await _context.LeaveRequests
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.LeaveRequestId == leaveId && l.OrganizationId == organizationId && !l.IsDeleted, ct)
                ?? throw NotFound();

            var userId = UserId(user);
            var isOwner = await _context.Employees.AnyAsync(e =>
                e.EmployeeId == leave.EmployeeId &&
                e.OrganizationId == organizationId &&
                e.UserId == userId &&
                !e.IsDeleted, ct);

            return (leave, isOwner);
        }

        private async Task<bool> HasPermissionAsync(ClaimsPrincipal user, string action) =>
            (await _authorization.AuthorizeAsync(user, null, $"Permission:Leave Management:{action}")).Succeeded;

        private static int UserId(ClaimsPrincipal user) =>
            int.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
                ? id
                : throw new LeaveAttachmentException(401, "UNAUTHORIZED", "Authentication required.");

        private static string SafeFileName(string? name, string contentType)
        {
            var clean = new string(Path.GetFileName(name ?? string.Empty).Where(c => !char.IsControl(c)).ToArray()).Trim();
            if (clean.Length == 0)
                clean = contentType == "application/pdf" ? "document.pdf" : "document";
            return clean.Length > 255 ? clean[^255..] : clean;
        }

        private static LeaveAttachmentException NotFound(string code = "NOT_FOUND", string message = "Leave request not found.") =>
            new(404, code, message);
    }
}
