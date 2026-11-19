using System.Data;
using System.Globalization;
using System.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Common;
using TalentSphereAPI.DTOs.PublicEnrollment;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Helpers;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services
{
    public interface IOrganizationEnrollmentService
    {
        // Payment verification
        Task<PagedResponse<EnrollmentPaymentReviewItemDto>> GetPaymentsAsync(OrganizationActor actor, string? status, string? search, int page, int pageSize, CancellationToken ct = default, bool newestFirst = false);
        Task<EnrollmentPaymentReviewItemDto> GetPaymentAsync(OrganizationActor actor, int paymentId, CancellationToken ct = default);
        Task<(FileStream Stream, string ContentType)> OpenScreenshotAsync(OrganizationActor actor, int paymentId, CancellationToken ct = default);
        Task<EnrollmentPaymentReviewItemDto> VerifyPaymentAsync(OrganizationActor actor, int paymentId, VerifyEnrollmentPaymentDto dto, CancellationToken ct = default);
        Task<EnrollmentPaymentReviewItemDto> RejectPaymentAsync(OrganizationActor actor, int paymentId, string reason, CancellationToken ct = default);

        // Enrollment approval
        Task<PagedResponse<EnrollmentApprovalItemDto>> GetApprovalsAsync(OrganizationActor actor, string? status, string? search, int page, int pageSize, CancellationToken ct = default);
        Task<List<EnrollmentHistoryItemDto>> GetHistoryAsync(OrganizationActor actor, int enrollmentId, CancellationToken ct = default);
        Task<EnrollmentApprovalResultDto> ApproveAsync(OrganizationActor actor, int enrollmentId, ApproveEnrollmentDto dto, CancellationToken ct = default);
        Task<ApprovalBatchOptionsDto> GetApprovalBatchesAsync(OrganizationActor actor, int enrollmentId, CancellationToken ct = default);
        Task<EnrollmentApprovalItemDto> RejectEnrollmentAsync(OrganizationActor actor, int enrollmentId, string reason, CancellationToken ct = default);
        Task<EnrollmentApprovalResultDto> ResendSetupLinkAsync(OrganizationActor actor, int enrollmentId, CancellationToken ct = default);
        /// <summary>Creates missing Invoice List rows for already-approved UPI enrollments (additive).</summary>
        Task<int> SyncApprovedInvoicesAsync(OrganizationActor actor, CancellationToken ct = default);

        // UPI settings
        Task<OrganizationPaymentSettingsDto> GetPaymentSettingsAsync(OrganizationActor actor, CancellationToken ct = default);
        Task<OrganizationPaymentSettingsDto> CreatePaymentSettingsAsync(OrganizationActor actor, UpdateOrganizationPaymentSettingsDto dto, CancellationToken ct = default);
        Task<OrganizationPaymentSettingsDto> UpdatePaymentSettingsAsync(OrganizationActor actor, UpdateOrganizationPaymentSettingsDto dto, CancellationToken ct = default);
        Task<OrganizationPaymentSettingsDto> UploadQrAsync(OrganizationActor actor, IFormFile file, CancellationToken ct = default);
        Task<(FileStream Stream, string ContentType)> OpenQrAsync(OrganizationActor actor, CancellationToken ct = default);
    }

    public class OrganizationEnrollmentService : IOrganizationEnrollmentService
    {
        private const long MaxQrBytes = 2 * 1024 * 1024;

        private readonly ApplicationDbContext _context;
        private readonly IPrivateFileStorage _storage;
        private readonly IEmailService _emailService;
        private readonly PublicEnrollmentOptions _options;
        private readonly ILogger<OrganizationEnrollmentService> _logger;

        public OrganizationEnrollmentService(
            ApplicationDbContext context,
            IPrivateFileStorage storage,
            IEmailService emailService,
            IOptions<PublicEnrollmentOptions> options,
            ILogger<OrganizationEnrollmentService> logger)
        {
            _context = context;
            _storage = storage;
            _emailService = emailService;
            _options = options.Value;
            _logger = logger;
        }

        // =========================================================
        // PAYMENT VERIFICATION
        // =========================================================

        public async Task<PagedResponse<EnrollmentPaymentReviewItemDto>> GetPaymentsAsync(
            OrganizationActor actor, string? status, string? search, int page, int pageSize, CancellationToken ct = default, bool newestFirst = false)
        {
            (page, pageSize) = (Math.Max(1, page), Math.Clamp(pageSize, 1, 100));

            var query = _context.CoursePayments.AsNoTracking()
                .Where(p => p.CourseEnrollment.OrganizationId == actor.OrganizationId);

            // Default: the verification queue. "Submitted"/"Pending" are accepted as aliases.
            if (string.Equals(status, "Submitted", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(status, "Pending", StringComparison.OrdinalIgnoreCase))
                status = nameof(EnrollmentPaymentStatus.PendingVerification);
            var statusFilter = ParseOrDefault(status, EnrollmentPaymentStatus.PendingVerification, allowAll: true);
            if (statusFilter.HasValue)
                query = query.Where(p => p.Status == statusFilter.Value);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(p =>
                    p.UtrNumber.Contains(term) ||
                    p.CourseEnrollment.EnrollmentNumber.Contains(term) ||
                    p.CourseEnrollment.Email.Contains(term) ||
                    p.CourseEnrollment.Phone.Contains(term) ||
                    p.CourseEnrollment.FullName.Contains(term));
            }

            var total = await query.CountAsync(ct);

            // Default: the verification queue (pending first, oldest first).
            // newestFirst: payment history, latest verification/submission first.
            var ordered = newestFirst
                ? query.OrderByDescending(p => p.ReviewedAt ?? p.SubmittedAt).ThenByDescending(p => p.CoursePaymentId)
                : query.OrderBy(p => p.Status == EnrollmentPaymentStatus.PendingVerification ? 0 : 1).ThenBy(p => p.SubmittedAt);

            var rows = await ordered
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(PaymentProjection())
                .ToListAsync(ct);

            return new PagedResponse<EnrollmentPaymentReviewItemDto>
            {
                Data = rows,
                TotalRecords = total,
                PageNumber = page,
                PageSize = pageSize
            };
        }

        public async Task<EnrollmentPaymentReviewItemDto> GetPaymentAsync(
            OrganizationActor actor, int paymentId, CancellationToken ct = default) =>
            await _context.CoursePayments.AsNoTracking()
                .Where(p => p.CoursePaymentId == paymentId && p.CourseEnrollment.OrganizationId == actor.OrganizationId)
                .Select(PaymentProjection())
                .FirstOrDefaultAsync(ct)
            ?? throw NotFound("PAYMENT_NOT_FOUND", "Payment not found.");

        public async Task<(FileStream Stream, string ContentType)> OpenScreenshotAsync(
            OrganizationActor actor, int paymentId, CancellationToken ct = default)
        {
            var payment = await _context.CoursePayments.AsNoTracking()
                .FirstOrDefaultAsync(p => p.CoursePaymentId == paymentId && p.CourseEnrollment.OrganizationId == actor.OrganizationId, ct)
                ?? throw NotFound("PAYMENT_NOT_FOUND", "Payment not found.");

            var stream = _storage.OpenRead(payment.ScreenshotStoragePath)
                ?? throw NotFound("SCREENSHOT_NOT_FOUND", "The screenshot file is missing.");

            return (stream, string.IsNullOrWhiteSpace(payment.ScreenshotContentType)
                ? ContentTypeFor(payment.ScreenshotStoragePath)
                : payment.ScreenshotContentType);
        }

        public async Task<EnrollmentPaymentReviewItemDto> VerifyPaymentAsync(
            OrganizationActor actor, int paymentId, VerifyEnrollmentPaymentDto dto, CancellationToken ct = default)
        {
            if (dto.ConfirmBankTransactionChecked == false)
            {
                throw new EnrollmentValidationException(new()
                {
                    ["confirmBankTransactionChecked"] = new[] { "Confirm that you matched this UTR and amount in your bank or UPI statement." }
                });
            }

            var (payment, application) = await LoadPaymentForReviewAsync(actor, paymentId, ct);

            var note = string.IsNullOrWhiteSpace(dto.EffectiveNote) ? null : dto.EffectiveNote.Trim();

            payment.Status = EnrollmentPaymentStatus.Verified;
            payment.ReviewNote = note;
            payment.VerifiedByUserId = actor.UserId;
            payment.ReviewedBy = actor.Actor;
            payment.ReviewedAt = DateTime.UtcNow;

            EnrollmentWorkflow.Transition(_context, application,
                action: "PaymentVerified",
                actor: actor.Actor, actorUserId: actor.UserId,
                enrollmentStatus: EnrollmentApplicationStatus.PendingApproval,
                paymentStatus: EnrollmentPaymentStatus.Verified,
                reason: note);

            await SaveReviewAsync(ct);

            await TrySendStudentEmailAsync(application,
                $"Payment verified — {application.EnrollmentNumber}",
                $"""
                <p>Hi {H(application.FirstName)},</p>
                <p>Your payment of <strong>₹{Money(payment.Amount)}</strong> (UTR {H(payment.UtrNumber)}) for
                   <strong>{H(application.Course.CourseName)}</strong> has been verified.</p>
                <p>Your enrollment is now waiting for approval. You will receive another email when it is approved.</p>
                """);

            return await GetPaymentItemAsync(payment.CoursePaymentId, ct);
        }

        public async Task<EnrollmentPaymentReviewItemDto> RejectPaymentAsync(
            OrganizationActor actor, int paymentId, string reason, CancellationToken ct = default)
        {
            reason = RequireReason(reason);
            var (payment, application) = await LoadPaymentForReviewAsync(actor, paymentId, ct);

            // The attempt is kept (status Rejected) for audit; the student may
            // resubmit with a different UTR (a UTR can only ever be used once).
            payment.Status = EnrollmentPaymentStatus.Rejected;
            payment.RejectionReason = reason;
            payment.VerifiedByUserId = actor.UserId;
            payment.ReviewedBy = actor.Actor;
            payment.ReviewedAt = DateTime.UtcNow;

            EnrollmentWorkflow.Transition(_context, application,
                action: "PaymentRejected",
                actor: actor.Actor, actorUserId: actor.UserId,
                enrollmentStatus: EnrollmentApplicationStatus.PendingPayment,
                paymentStatus: EnrollmentPaymentStatus.Rejected,
                reason: reason);

            await SaveReviewAsync(ct);

            await TrySendStudentEmailAsync(application,
                $"Action needed: payment proof rejected — {application.EnrollmentNumber}",
                $"""
                <p>Hi {H(application.FirstName)},</p>
                <p>Your payment proof for <strong>{H(application.Course.CourseName)}</strong> (UTR {H(payment.UtrNumber)})
                   could not be verified.</p>
                <p><strong>Reason:</strong> {H(reason)}</p>
                <p>Please open your enrollment link to submit the correct payment details again.
                   {(string.IsNullOrWhiteSpace(_options.FrontendBaseUrl) ? "" :
                     $"If you no longer have the link, request a new one at <a href=\"{H(Frontend("/enrollment/access"))}\">{H(Frontend("/enrollment/access"))}</a>.")}</p>
                """);

            return await GetPaymentItemAsync(payment.CoursePaymentId, ct);
        }

        private async Task<(CoursePayment Payment, CourseEnrollment Application)> LoadPaymentForReviewAsync(
            OrganizationActor actor, int paymentId, CancellationToken ct)
        {
            var payment = await _context.CoursePayments
                .Include(p => p.CourseEnrollment).ThenInclude(a => a.Course)
                .FirstOrDefaultAsync(p => p.CoursePaymentId == paymentId && p.CourseEnrollment.OrganizationId == actor.OrganizationId, ct)
                ?? throw NotFound("PAYMENT_NOT_FOUND", "Payment not found.");

            var application = payment.CourseEnrollment;

            // Defense in depth: the application must belong to the same organization.
            if (application.OrganizationId != actor.OrganizationId)
                throw NotFound("PAYMENT_NOT_FOUND", "Payment not found.");

            if (payment.Status != EnrollmentPaymentStatus.PendingVerification ||
                application.PaymentStatus != EnrollmentPaymentStatus.PendingVerification ||
                application.EnrollmentStatus != EnrollmentApplicationStatus.PendingPayment)
            {
                throw new EnrollmentWorkflowException(409, "PAYMENT_ALREADY_REVIEWED",
                    $"This payment has already been reviewed (status: {payment.Status}).");
            }

            return (payment, application);
        }

        private async Task<EnrollmentPaymentReviewItemDto> GetPaymentItemAsync(int paymentId, CancellationToken ct) =>
            await _context.CoursePayments.AsNoTracking()
                .Where(p => p.CoursePaymentId == paymentId)
                .Select(PaymentProjection())
                .FirstAsync(ct);

        private static System.Linq.Expressions.Expression<Func<CoursePayment, EnrollmentPaymentReviewItemDto>> PaymentProjection() =>
            p => new EnrollmentPaymentReviewItemDto
            {
                PaymentId = p.CoursePaymentId,
                EnrollmentId = p.CourseEnrollmentId,
                EnrollmentNumber = p.CourseEnrollment.EnrollmentNumber,
                StudentName = p.CourseEnrollment.FullName,
                Email = p.CourseEnrollment.Email,
                Phone = p.CourseEnrollment.Phone,
                HighestQualification = p.CourseEnrollment.HighestQualification ?? "",
                CourseId = p.CourseEnrollment.CourseId,
                CourseName = p.CourseEnrollment.Course.CourseName,
                BatchName = p.CourseEnrollment.Batch != null ? p.CourseEnrollment.Batch.BatchName : null,
                CourseFee = p.CourseEnrollment.FeeAmount,
                Amount = p.Amount,
                UtrNumber = p.UtrNumber,
                PaymentDate = p.PaymentDate,
                SubmittedAt = p.SubmittedAt,
                Status = p.Status.ToString(),
                EnrollmentStatus = p.CourseEnrollment.EnrollmentStatus.ToString(),
                RejectionReason = p.RejectionReason,
                Remarks = p.RejectionReason ?? p.ReviewNote,
                ReviewedBy = p.ReviewedBy,
                ReviewedAt = p.ReviewedAt,
                AttemptNumber = p.CourseEnrollment.Payments.Count(x => x.SubmittedAt <= p.SubmittedAt),
                PreviousRejections = p.CourseEnrollment.Payments.Count(x =>
                    x.Status == EnrollmentPaymentStatus.Rejected && x.SubmittedAt < p.SubmittedAt),
                ScreenshotUrl = "/api/v1/organization/enrollment-payments/" + p.CoursePaymentId + "/screenshot",
                ScreenshotContentType = p.ScreenshotContentType ?? ""
            };

        // =========================================================
        // ENROLLMENT APPROVAL
        // =========================================================

        public async Task<PagedResponse<EnrollmentApprovalItemDto>> GetApprovalsAsync(
            OrganizationActor actor, string? status, string? search, int page, int pageSize, CancellationToken ct = default)
        {
            (page, pageSize) = (Math.Max(1, page), Math.Clamp(pageSize, 1, 100));

            var query = _context.CourseEnrollments.AsNoTracking()
                .Where(a => a.OrganizationId == actor.OrganizationId);

            // Default: verified payments waiting for approval. Only verified
            // enrollments are ever listed here.
            var statusFilter = ParseOrDefault(status, EnrollmentApplicationStatus.PendingApproval, allowAll: true);
            if (statusFilter.HasValue)
                query = query.Where(a => a.EnrollmentStatus == statusFilter.Value);
            else
                query = query.Where(a =>
                    a.EnrollmentStatus == EnrollmentApplicationStatus.PendingApproval ||
                    a.EnrollmentStatus == EnrollmentApplicationStatus.Approved ||
                    (a.EnrollmentStatus == EnrollmentApplicationStatus.Rejected &&
                     a.PaymentStatus == EnrollmentPaymentStatus.Verified));

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(a =>
                    a.EnrollmentNumber.Contains(term) ||
                    a.Email.Contains(term) ||
                    a.Phone.Contains(term) ||
                    a.FullName.Contains(term));
            }

            var total = await query.CountAsync(ct);
            var rows = await query
                .OrderBy(a => a.UpdatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(ApprovalProjection())
                .ToListAsync(ct);

            await FillExistingAccountFlagsAsync(rows, ct);

            return new PagedResponse<EnrollmentApprovalItemDto>
            {
                Data = rows,
                TotalRecords = total,
                PageNumber = page,
                PageSize = pageSize
            };
        }

        public async Task<List<EnrollmentHistoryItemDto>> GetHistoryAsync(
            OrganizationActor actor, int enrollmentId, CancellationToken ct = default)
        {
            var owned = await _context.CourseEnrollments.AsNoTracking()
                .AnyAsync(a => a.CourseEnrollmentId == enrollmentId && a.OrganizationId == actor.OrganizationId, ct);
            if (!owned)
                throw NotFound("ENROLLMENT_NOT_FOUND", "Enrollment not found.");

            var rows = await _context.EnrollmentApprovalHistories.AsNoTracking()
                .Where(h => h.CourseEnrollmentId == enrollmentId)
                .OrderBy(h => h.CreatedAt).ThenBy(h => h.EnrollmentApprovalHistoryId)
                .ToListAsync(ct);

            return rows.Select(h =>
            {
                var from = EnrollmentWorkflow.ParseSnapshot(h.FromStatus);
                var to = EnrollmentWorkflow.ParseSnapshot(h.ToStatus);
                return new EnrollmentHistoryItemDto
                {
                    Action = h.Action,
                    FromEnrollmentStatus = from.Enrollment,
                    ToEnrollmentStatus = to.Enrollment,
                    FromPaymentStatus = from.Payment,
                    ToPaymentStatus = to.Payment,
                    FromAccountStatus = from.Account,
                    ToAccountStatus = to.Account,
                    Reason = h.Reason,
                    Actor = h.Actor ?? (h.ActionByUserId is int id ? $"User:{id}" : "System"),
                    CreatedAt = h.CreatedAt
                };
            }).ToList();
        }

        /// <summary>
        /// Approves a payment-verified enrollment and provisions the student
        /// account in ONE serializable transaction. Idempotent: a repeated
        /// call on an approved enrollment changes nothing, and existing
        /// Student/User/StudentEnrollment rows are reused, never duplicated.
        /// </summary>
        public async Task<EnrollmentApprovalResultDto> ApproveAsync(
            OrganizationActor actor, int enrollmentId, ApproveEnrollmentDto dto, CancellationToken ct = default)
        {
            var preview = await _context.CourseEnrollments.AsNoTracking()
                .FirstOrDefaultAsync(a => a.CourseEnrollmentId == enrollmentId && a.OrganizationId == actor.OrganizationId, ct)
                ?? throw NotFound("ENROLLMENT_NOT_FOUND", "Enrollment not found.");

            if (preview.EnrollmentStatus == EnrollmentApplicationStatus.Approved)
            {
                return new EnrollmentApprovalResultDto
                {
                    EnrollmentId = preview.CourseEnrollmentId,
                    StudentId = preview.StudentId,
                    CourseId = preview.CourseId,
                    PaymentStatus = preview.PaymentStatus.ToString(),
                    ApprovedBy = preview.ReviewedBy,
                    ApprovedAt = preview.ReviewedAt,
                    EnrollmentStatus = preview.EnrollmentStatus.ToString(),
                    AccountStatus = preview.AccountStatus.ToString(),
                    AlreadyApproved = true,
                    Message = "This enrollment is already approved."
                };
            }

            EnsureApprovable(preview);

            // The reviewer must pick the batch (only batches of this enrollment's
            // course and organization are accepted; checked again in ProvisionAsync).
            if (dto.BatchId is not int requestedBatch || requestedBatch <= 0)
            {
                throw new EnrollmentValidationException(new()
                {
                    ["batchId"] = new[] { "Select a batch for this student before approving." }
                });
            }

            var remarks = string.IsNullOrWhiteSpace(dto.Remarks) ? null : dto.Remarks.Trim();
            ProvisioningResult result;
            // Serializable on MySQL (same as the existing student approval);
            // the plain overload keeps non-relational test providers working.
            await using (var transaction = _context.Database.IsRelational()
                             ? await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct)
                             : await _context.Database.BeginTransactionAsync(ct))
            {
                try
                {
                    result = await ProvisionAsync(actor, enrollmentId, dto.BatchId, remarks, ct);
                    await _context.SaveChangesAsync(ct);
                    await transaction.CommitAsync(ct);
                }
                catch (DbUpdateConcurrencyException)
                {
                    await transaction.RollbackAsync(ct);
                    throw new EnrollmentWorkflowException(409, "ALREADY_PROCESSED",
                        "This enrollment was just updated by someone else. Refresh and try again.");
                }
                catch (EnrollmentWorkflowException)
                {
                    await transaction.RollbackAsync(ct);
                    throw;
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync(ct);
                    await RecordProvisioningFailureAsync(enrollmentId, actor, ex);
                    throw new EnrollmentWorkflowException(500, "PROVISIONING_FAILED",
                        "The student account could not be created. Nothing was approved; please retry.");
                }
            }

            var emailSent = result.LinkedExistingAccount
                ? await SendExistingAccountEmailAsync(result.Application)
                : await SendSetupEmailAsync(result.Application, result.SetupToken!);

            if (!emailSent)
                await RecordEmailFailureAsync(result.Application.CourseEnrollmentId);

            return new EnrollmentApprovalResultDto
            {
                EnrollmentId = result.Application.CourseEnrollmentId,
                StudentId = result.Application.StudentId,
                CourseId = result.Application.CourseId,
                PaymentStatus = result.Application.PaymentStatus.ToString(),
                ApprovedBy = result.Application.ReviewedBy,
                ApprovedAt = result.Application.ReviewedAt,
                Remarks = remarks,
                EnrollmentStatus = result.Application.EnrollmentStatus.ToString(),
                AccountStatus = result.Application.AccountStatus.ToString(),
                LinkedExistingAccount = result.LinkedExistingAccount,
                SetupEmailSent = emailSent,
                Message = result.LinkedExistingAccount
                    ? "Enrollment approved and added to the student's existing account."
                    : emailSent
                        ? "Enrollment approved. A password setup link was emailed to the student."
                        : "Enrollment approved, but the setup email failed. Use \"Resend setup link\"."
            };
        }

        private sealed record ProvisioningResult(CourseEnrollment Application, bool LinkedExistingAccount, string? SetupToken);

        private async Task<ProvisioningResult> ProvisionAsync(
            OrganizationActor actor, int enrollmentId, int? requestedBatchId, string? remarks, CancellationToken ct)
        {
            // Re-read inside the transaction.
            var application = await _context.CourseEnrollments
                .Include(a => a.Course)
                .Include(a => a.Organization)
                .FirstOrDefaultAsync(a => a.CourseEnrollmentId == enrollmentId && a.OrganizationId == actor.OrganizationId, ct)
                ?? throw NotFound("ENROLLMENT_NOT_FOUND", "Enrollment not found.");

            EnsureApprovable(application);

            if (application.Course.OrganizationId != application.OrganizationId)
                throw new EnrollmentWorkflowException(409, "COURSE_OWNERSHIP_MISMATCH", "The course does not belong to this organization.");

            // ---- Batch: the reviewer's choice, re-checked against the stored
            // enrollment's course and organization (never the browser's). ----
            var batchId = requestedBatchId
                ?? throw new EnrollmentValidationException(new()
                {
                    ["batchId"] = new[] { "Select a batch for this student before approving." }
                });

            var batch = await _context.Batches
                .FirstOrDefaultAsync(b =>
                    b.BatchId == batchId &&
                    b.CourseId == application.CourseId &&
                    b.OrganizationId == application.OrganizationId, ct)
                ?? throw new EnrollmentWorkflowException(400, "INVALID_BATCH",
                    $"The selected batch is not a batch of \"{application.Course.CourseName}\" in your organization.");

            if (batch.Status is not (BatchStatus.Upcoming or BatchStatus.Active))
                throw new EnrollmentWorkflowException(409, "BATCH_CLOSED", "The selected batch is no longer open. Choose another batch."); 

            // ---- Existing account? ----
            var email = application.Email;
            var users = await _context.Users
                .Where(u => u.Email == email && !u.IsDeleted)
                .ToListAsync(ct);

            if (users.Count > 1)
                throw new EnrollmentWorkflowException(409, "ACCOUNT_CONFLICT",
                    "More than one account uses this email. Resolve the duplicate accounts before approving.");

            var user = users.SingleOrDefault();
            if (user != null && (user.Role != UserRole.Student || user.OrganizationId != application.OrganizationId))
            {
                throw new EnrollmentWorkflowException(409, "ACCOUNT_CONFLICT",
                    "This email belongs to a non-student account or another organization. " +
                    "Ask the student to enroll with a different email.");
            }

            var students = await _context.Students
                .Where(s => s.Email == email && !s.IsDeleted)
                .ToListAsync(ct);

            if (students.Any(s => s.OrganizationId != application.OrganizationId))
            {
                // Student login resolves the profile by email across all organizations.
                throw new EnrollmentWorkflowException(409, "ACCOUNT_CONFLICT",
                    "This email is already registered as a student of another organization.");
            }

            var student = students.OrderBy(s => s.StudentId).FirstOrDefault();
            var linkedExisting = user != null;

            // ---- Student profile (reuse, never duplicate) ----
            if (student == null)
            {
                student = new Student
                {
                    OrganizationId = application.OrganizationId,
                    FirstName = application.FirstName,
                    LastName = application.LastName,
                    Email = email,
                    Phone = application.Phone,
                    CourseId = application.CourseId,
                    BatchId = batch.BatchId,
                    MentorId = batch.MentorId > 0 ? batch.MentorId : null,
                    Status = "Active",
                    PasswordHash = string.Empty // credentials live on Users
                };
                _context.Students.Add(student);
                await _context.SaveChangesAsync(ct);
            }
            else if (!string.Equals(student.Status, "Active", StringComparison.OrdinalIgnoreCase))
            {
                student.Status = "Active";
            }

            // ---- Active course enrollment (same rules as StudentService) ----
            var activeForCourse = await _context.StudentEnrollments
                .Where(e =>
                    e.StudentId == student.StudentId &&
                    e.OrganizationId == application.OrganizationId &&
                    e.CourseId == application.CourseId &&
                    e.IsActive && e.EndedAt == null)
                .ToListAsync(ct);

            var enrollment = activeForCourse.FirstOrDefault(e => e.BatchId == batch.BatchId);
            if (enrollment == null)
            {
                foreach (var old in activeForCourse)
                {
                    old.IsActive = false;
                    old.EndedAt = DateTime.UtcNow;
                }

                if (batch.EnrolledStudents >= batch.Capacity)
                    throw new EnrollmentWorkflowException(409, "BATCH_FULL", "The selected batch is full. Choose another batch.");

                enrollment = new StudentEnrollment
                {
                    StudentId = student.StudentId,
                    OrganizationId = application.OrganizationId,
                    CourseId = application.CourseId,
                    BatchId = batch.BatchId,
                    IsActive = true,
                    EnrolledAt = DateTime.UtcNow
                };
                _context.StudentEnrollments.Add(enrollment);
                batch.EnrolledStudents += 1;
                // Persist old enrollments as inactive before the new active
                // row hits the unique (Org, Student, ActiveCourseId) index.
                await _context.SaveChangesAsync(ct);
            }

            // ---- User account ----
            string? setupToken = null;
            if (user == null)
            {
                var phoneTaken = await _context.Users
                    .AnyAsync(u => u.Phone == application.Phone && !u.IsDeleted, ct);

                user = new User
                {
                    OrganizationId = application.OrganizationId,
                    FirstName = application.FirstName,
                    LastName = application.LastName,
                    Email = email,
                    // Avoid two accounts answering to the same phone at login.
                    Phone = phoneTaken ? null : application.Phone,
                    Role = UserRole.Student,
                    // Unusable random secret: login is impossible until the
                    // student sets a password through the setup link.
                    PasswordHash = PasswordHelper.HashPassword(SecureTokenHelper.GenerateToken()),
                    IsEmailVerified = false,
                    IsPhoneVerified = false,
                    CreatedDate = DateTime.UtcNow
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync(ct);

                setupToken = IssueSetupToken(user.UserId, application);
            }

            // ---- Application ----
            if (application.BatchId != batch.BatchId)
            {
                _context.BatchAssignmentHistories.Add(new BatchAssignmentHistory
                {
                    CourseEnrollmentId = application.CourseEnrollmentId,
                    PreviousBatchId = application.BatchId,
                    NewBatchId = batch.BatchId,
                    ActionByUserId = actor.UserId,
                    Actor = actor.Actor,
                    Remarks = application.BatchId == null ? "Batch assigned at approval" : "Batch changed at approval",
                    CreatedAt = DateTime.UtcNow
                });
            }

            application.BatchId = batch.BatchId;
            application.StudentId = student.StudentId;
            application.UserId = user.UserId;
            application.ReviewedBy = actor.Actor;
            application.ReviewedAt = DateTime.UtcNow;
            application.RejectionReason = null;

            EnrollmentWorkflow.Transition(_context, application,
                action: linkedExisting ? "ApprovedLinkedExistingAccount" : "Approved",
                actor: actor.Actor, actorUserId: actor.UserId,
                enrollmentStatus: EnrollmentApplicationStatus.Approved,
                paymentStatus: EnrollmentPaymentStatus.Verified,
                accountStatus: linkedExisting ? EnrollmentAccountStatus.Active : EnrollmentAccountStatus.PendingSetup,
                reason: remarks);

            // Show the paid course fee in the organization's Invoice List
            // (saved in the same transaction as the approval).
            await UpiEnrollmentInvoices.AddIfMissingAsync(_context, application, ct);

            return new ProvisioningResult(application, linkedExisting, setupToken);
        }

        private static void EnsureApprovable(CourseEnrollment application)
        {
            if (application.EnrollmentStatus == EnrollmentApplicationStatus.Approved)
                throw new EnrollmentWorkflowException(409, "ALREADY_APPROVED", "This enrollment is already approved.");

            // Approval is never allowed before payment verification.
            if (application.PaymentStatus != EnrollmentPaymentStatus.Verified ||
                application.EnrollmentStatus != EnrollmentApplicationStatus.PendingApproval)
            {
                throw new EnrollmentWorkflowException(409, "PAYMENT_NOT_VERIFIED",
                    "The payment must be verified before the enrollment can be approved.");
            }
        }

        public async Task<EnrollmentApprovalItemDto> RejectEnrollmentAsync(
            OrganizationActor actor, int enrollmentId, string reason, CancellationToken ct = default)
        {
            reason = RequireReason(reason);

            var application = await _context.CourseEnrollments
                .Include(a => a.Course)
                .FirstOrDefaultAsync(a => a.CourseEnrollmentId == enrollmentId && a.OrganizationId == actor.OrganizationId, ct)
                ?? throw NotFound("ENROLLMENT_NOT_FOUND", "Enrollment not found.");

            if (application.EnrollmentStatus != EnrollmentApplicationStatus.PendingApproval)
            {
                throw new EnrollmentWorkflowException(409, "NOT_PENDING_APPROVAL",
                    $"Only enrollments waiting for approval can be rejected (status: {application.EnrollmentStatus}).");
            }

            application.RejectionReason = reason;
            application.ReviewedBy = actor.Actor;
            application.ReviewedAt = DateTime.UtcNow;

            // Payment stays Verified: any refund is handled outside the system.
            EnrollmentWorkflow.Transition(_context, application,
                action: "EnrollmentRejected",
                actor: actor.Actor, actorUserId: actor.UserId,
                enrollmentStatus: EnrollmentApplicationStatus.Rejected,
                reason: reason);

            await SaveReviewAsync(ct);

            await TrySendStudentEmailAsync(application,
                $"Enrollment update — {application.EnrollmentNumber}",
                $"""
                <p>Hi {H(application.FirstName)},</p>
                <p>Your enrollment in <strong>{H(application.Course.CourseName)}</strong> was not approved.</p>
                <p><strong>Reason:</strong> {H(reason)}</p>
                <p>Please contact the organization about your verified payment.</p>
                """);

            var item = await _context.CourseEnrollments.AsNoTracking()
                .Where(a => a.CourseEnrollmentId == enrollmentId)
                .Select(ApprovalProjection())
                .FirstAsync(ct);
            return item;
        }

        public Task<int> SyncApprovedInvoicesAsync(OrganizationActor actor, CancellationToken ct = default) =>
            UpiEnrollmentInvoices.BackfillAsync(_context, actor.OrganizationId, ct);

        public async Task<EnrollmentApprovalResultDto> ResendSetupLinkAsync(
            OrganizationActor actor, int enrollmentId, CancellationToken ct = default)
        {
            var application = await _context.CourseEnrollments
                .Include(a => a.Course)
                .Include(a => a.Organization)
                .FirstOrDefaultAsync(a => a.CourseEnrollmentId == enrollmentId && a.OrganizationId == actor.OrganizationId, ct)
                ?? throw NotFound("ENROLLMENT_NOT_FOUND", "Enrollment not found.");

            if (application.EnrollmentStatus != EnrollmentApplicationStatus.Approved ||
                application.AccountStatus != EnrollmentAccountStatus.PendingSetup ||
                application.UserId is not int userId)
            {
                throw new EnrollmentWorkflowException(409, "SETUP_NOT_PENDING",
                    "A setup link can only be resent for approved enrollments whose account is waiting for setup.");
            }

            var token = IssueSetupToken(userId, application);
            _context.EnrollmentApprovalHistories.Add(new EnrollmentApprovalHistory
            {
                CourseEnrollmentId = application.CourseEnrollmentId,
                Action = "SetupLinkResent",
                Actor = actor.Actor,
                ActionByUserId = actor.UserId,
                FromStatus = EnrollmentWorkflow.StatusSnapshot(application),
                ToStatus = EnrollmentWorkflow.StatusSnapshot(application),
                CreatedAt = DateTime.UtcNow
            });
            application.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(ct);

            var sent = await SendSetupEmailAsync(application, token);
            if (!sent)
                await RecordEmailFailureAsync(application.CourseEnrollmentId);

            return new EnrollmentApprovalResultDto
            {
                EnrollmentId = application.CourseEnrollmentId,
                StudentId = application.StudentId,
                CourseId = application.CourseId,
                PaymentStatus = application.PaymentStatus.ToString(),
                ApprovedBy = application.ReviewedBy,
                ApprovedAt = application.ReviewedAt,
                EnrollmentStatus = application.EnrollmentStatus.ToString(),
                AccountStatus = application.AccountStatus.ToString(),
                SetupEmailSent = sent,
                Message = sent ? "A new password setup link was emailed." : "The setup email could not be sent. Check SMTP settings."
            };
        }

        /// <summary>Revokes earlier unused tokens and adds a new hashed one (caller saves).</summary>
        private string IssueSetupToken(int userId, CourseEnrollment application)
        {
            var now = DateTime.UtcNow;
            foreach (var old in _context.PasswordSetupTokens
                         .Where(t => t.UserId == userId && t.UsedAt == null && t.RevokedAt == null))
            {
                old.RevokedAt = now;
            }

            var token = SecureTokenHelper.GenerateToken();
            _context.PasswordSetupTokens.Add(new PasswordSetupToken
            {
                UserId = userId,
                CourseEnrollmentId = application.CourseEnrollmentId,
                TokenHash = SecureTokenHelper.Hash(token),
                Purpose = PasswordSetupTokenPurpose.InitialSetup,
                ExpiresAt = now.AddHours(_options.PasswordSetupTokenLifetimeHours),
                CreatedAt = now
            });
            return token;
        }

        private async Task RecordProvisioningFailureAsync(int enrollmentId, OrganizationActor actor, Exception ex)
        {
            _logger.LogError(ex, "Provisioning failed for enrollment {Id}", enrollmentId);
            try
            {
                _context.ChangeTracker.Clear();
                var application = await _context.CourseEnrollments.FindAsync(enrollmentId);

                // A concurrent approval may have succeeded (e.g. this call lost a
                // deadlock); never mark an approved enrollment as failed.
                if (application == null || application.EnrollmentStatus == EnrollmentApplicationStatus.Approved)
                    return;

                EnrollmentWorkflow.Transition(_context, application,
                    action: "ProvisioningFailed",
                    actor: actor.Actor, actorUserId: actor.UserId,
                    accountStatus: EnrollmentAccountStatus.ProvisioningFailed,
                    reason: Truncate("Approval rolled back; retry approval. " + ex.GetBaseException().Message, 500));
                await _context.SaveChangesAsync();
            }
            catch (Exception logEx)
            {
                _logger.LogError(logEx, "Could not record provisioning failure for enrollment {Id}", enrollmentId);
            }
        }

        private async Task RecordEmailFailureAsync(int enrollmentId)
        {
            try
            {
                _context.ChangeTracker.Clear();
                var application = await _context.CourseEnrollments.FindAsync(enrollmentId);
                if (application == null) return;
                _context.EnrollmentApprovalHistories.Add(new EnrollmentApprovalHistory
                {
                    CourseEnrollmentId = enrollmentId,
                    Action = SetupEmailFailedAction,
                    Actor = "System",
                    FromStatus = EnrollmentWorkflow.StatusSnapshot(application),
                    ToStatus = EnrollmentWorkflow.StatusSnapshot(application),
                    Reason = "Setup email could not be sent. Use \"Resend setup link\".",
                    CreatedAt = DateTime.UtcNow
                });
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not record email failure for enrollment {Id}", enrollmentId);
            }
        }

        /// <summary>
        /// Batches the reviewer may assign: same course and organization as the
        /// stored enrollment, Upcoming or Active, with a free seat.
        /// </summary>
        public async Task<ApprovalBatchOptionsDto> GetApprovalBatchesAsync(
            OrganizationActor actor, int enrollmentId, CancellationToken ct = default)
        {
            var application = await _context.CourseEnrollments.AsNoTracking()
                .Include(a => a.Course)
                .FirstOrDefaultAsync(a => a.CourseEnrollmentId == enrollmentId && a.OrganizationId == actor.OrganizationId, ct)
                ?? throw NotFound("ENROLLMENT_NOT_FOUND", "Enrollment not found.");

            var batches = await _context.Batches.AsNoTracking()
                .Where(b =>
                    b.CourseId == application.CourseId &&
                    b.OrganizationId == application.OrganizationId &&
                    (b.Status == BatchStatus.Upcoming || b.Status == BatchStatus.Active) &&
                    b.EnrolledStudents < b.Capacity)
                .OrderBy(b => b.StartDate).ThenBy(b => b.BatchName)
                .Select(b => new ApprovalBatchOptionDto
                {
                    BatchId = b.BatchId,
                    BatchName = b.BatchName,
                    Status = b.Status.ToString(),
                    StartDate = b.StartDate,
                    EndDate = b.EndDate,
                    Capacity = b.Capacity,
                    EnrolledStudents = b.EnrolledStudents
                })
                .ToListAsync(ct);

            return new ApprovalBatchOptionsDto
            {
                EnrollmentId = application.CourseEnrollmentId,
                CourseId = application.CourseId,
                CourseName = application.Course.CourseName,
                StudentChosenBatchId = batches.Any(b => b.BatchId == application.BatchId) ? application.BatchId : null,
                Batches = batches
            };
        }

        private static System.Linq.Expressions.Expression<Func<CourseEnrollment, EnrollmentApprovalItemDto>> ApprovalProjection() =>
            a => new EnrollmentApprovalItemDto
            {
                EnrollmentId = a.CourseEnrollmentId,
                EnrollmentNumber = a.EnrollmentNumber,
                StudentName = a.FullName,
                Email = a.Email,
                Phone = a.Phone,
                HighestQualification = a.HighestQualification ?? "",
                InstitutionName = a.InstitutionName,
                Address = a.Address,
                StudentId = a.StudentId,
                OrganizationId = a.OrganizationId,
                CourseId = a.CourseId,
                CourseName = a.Course.CourseName,
                BatchId = a.BatchId,
                BatchName = a.Batch != null ? a.Batch.BatchName : null,
                FeeAmount = a.FeeAmount,
                EnrollmentStatus = a.EnrollmentStatus.ToString(),
                PaymentStatus = a.PaymentStatus.ToString(),
                AccountStatus = a.AccountStatus.ToString(),
                VerifiedPaymentId = a.Payments.Where(p => p.Status == EnrollmentPaymentStatus.Verified).Select(p => (int?)p.CoursePaymentId).FirstOrDefault(),
                VerifiedUtrNumber = a.Payments.Where(p => p.Status == EnrollmentPaymentStatus.Verified).Select(p => p.UtrNumber).FirstOrDefault(),
                PaymentVerifiedAt = a.Payments.Where(p => p.Status == EnrollmentPaymentStatus.Verified).Select(p => p.ReviewedAt).FirstOrDefault(),
                PaymentVerifiedBy = a.Payments.Where(p => p.Status == EnrollmentPaymentStatus.Verified).Select(p => p.ReviewedBy).FirstOrDefault(),
                ReviewedBy = a.ReviewedBy,
                ReviewedAt = a.ReviewedAt,
                RejectionReason = a.RejectionReason,
                // Latest problem worth showing to the reviewer, from the history.
                LastProvisioningError = a.StatusHistory
                    .OrderByDescending(h => h.CreatedAt).ThenByDescending(h => h.EnrollmentApprovalHistoryId)
                    .Where(h => h.Action == SetupEmailFailedAction || h.Action == "ProvisioningFailed" || h.Action == "SetupLinkResent" || h.Action.StartsWith("Approved"))
                    .Select(h => h.Action == SetupEmailFailedAction || h.Action == "ProvisioningFailed" ? h.Reason : null)
                    .FirstOrDefault(),
                ProvisioningAttempts = a.StatusHistory.Count(h => h.Action == "ProvisioningFailed" || h.Action.StartsWith("Approved")),
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt ?? a.CreatedAt
            };

        private const string SetupEmailFailedAction = "SetupEmailFailed";

        private async Task FillExistingAccountFlagsAsync(List<EnrollmentApprovalItemDto> rows, CancellationToken ct)
        {
            var emails = rows.Where(r => r.EnrollmentStatus == nameof(EnrollmentApplicationStatus.PendingApproval))
                .Select(r => r.Email).Distinct().ToList();
            if (emails.Count == 0) return;

            var existing = await _context.Users.AsNoTracking()
                .Where(u => u.Email != null && emails.Contains(u.Email) && !u.IsDeleted)
                .Select(u => u.Email!)
                .ToListAsync(ct);

            var set = new HashSet<string>(existing, StringComparer.OrdinalIgnoreCase);
            foreach (var row in rows)
                row.ExistingAccount = set.Contains(row.Email);
        }

        // =========================================================
        // UPI SETTINGS (Organization / Organization Admin only)
        // =========================================================

        public async Task<OrganizationPaymentSettingsDto> GetPaymentSettingsAsync(OrganizationActor actor, CancellationToken ct = default)
        {
            await EnsureOrganizationAsync(actor, ct);
            var setting = await _context.OrganizationPaymentSettings.AsNoTracking()
                .FirstOrDefaultAsync(x => x.OrganizationId == actor.OrganizationId, ct);
            return ToSettings(actor.OrganizationId, setting);
        }

        public async Task<OrganizationPaymentSettingsDto> CreatePaymentSettingsAsync(
            OrganizationActor actor, UpdateOrganizationPaymentSettingsDto dto, CancellationToken ct = default)
        {
            var org = await EnsureOrganizationAsync(actor, ct);
            if (await _context.OrganizationPaymentSettings.AnyAsync(x => x.OrganizationId == actor.OrganizationId, ct))
            {
                throw new EnrollmentWorkflowException(409, "PAYMENT_SETTINGS_EXIST",
                    "UPI settings already exist for this organization. Use PUT to update them.");
            }

            var setting = new OrganizationPaymentSetting { OrganizationId = actor.OrganizationId, CreatedAt = DateTime.UtcNow };
            ApplySettings(setting, dto, org.OrganizationName, defaultActive: true);
            _context.OrganizationPaymentSettings.Add(setting);
            await SaveSettingsAsync(ct);
            return ToSettings(actor.OrganizationId, setting);
        }

        /// <summary>Creates the settings row on first save, then updates it.</summary>
        public async Task<OrganizationPaymentSettingsDto> UpdatePaymentSettingsAsync(
            OrganizationActor actor, UpdateOrganizationPaymentSettingsDto dto, CancellationToken ct = default)
        {
            var org = await EnsureOrganizationAsync(actor, ct);
            var setting = await _context.OrganizationPaymentSettings
                .FirstOrDefaultAsync(x => x.OrganizationId == actor.OrganizationId, ct);

            if (setting == null)
            {
                setting = new OrganizationPaymentSetting { OrganizationId = actor.OrganizationId, CreatedAt = DateTime.UtcNow };
                _context.OrganizationPaymentSettings.Add(setting);
                ApplySettings(setting, dto, org.OrganizationName, defaultActive: true);
            }
            else
            {
                ApplySettings(setting, dto, org.OrganizationName, defaultActive: setting.IsActive);
                setting.UpdatedAt = DateTime.UtcNow;
            }

            await SaveSettingsAsync(ct);
            return ToSettings(actor.OrganizationId, setting);
        }

        // OrganizationId always comes from the resolved actor, never the body.
        private static void ApplySettings(OrganizationPaymentSetting setting, UpdateOrganizationPaymentSettingsDto dto,
            string organizationName, bool defaultActive)
        {
            var payee = dto.EffectivePayeeName;
            setting.UpiId = (dto.UpiId ?? string.Empty).Trim();
            setting.PayeeName = string.IsNullOrWhiteSpace(payee) ? organizationName : payee.Trim();
            setting.IsActive = dto.IsActive ?? defaultActive;
        }

        private async Task SaveSettingsAsync(CancellationToken ct)
        {
            try
            {
                await _context.SaveChangesAsync(ct);
            }
            catch (DbUpdateException ex) when (EnrollmentWorkflow.IsDuplicateKey(ex))
            {
                throw new EnrollmentWorkflowException(409, "PAYMENT_SETTINGS_EXIST",
                    "UPI settings were just created for this organization. Refresh and try again.");
            }
        }

        public async Task<OrganizationPaymentSettingsDto> UploadQrAsync(
            OrganizationActor actor, IFormFile file, CancellationToken ct = default)
        {
            await EnsureOrganizationAsync(actor, ct);
            var setting = await _context.OrganizationPaymentSettings
                .FirstOrDefaultAsync(x => x.OrganizationId == actor.OrganizationId, ct)
                ?? throw new EnrollmentWorkflowException(409, "PAYMENT_SETTINGS_REQUIRED",
                    "Save your UPI ID before uploading a QR code.");

            var (image, error) = await _storage.SaveImageAsync(
                file, PublicEnrollmentService.UpiQrCategory, actor.OrganizationId, MaxQrBytes, ct);
            if (image == null)
                throw new EnrollmentValidationException(new() { ["file"] = new[] { error! } });

            var previous = setting.QrCodePath;
            setting.QrCodePath = image.StoragePath;
            setting.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync(ct);
            }
            catch
            {
                _storage.TryDelete(image.StoragePath);
                throw;
            }

            _storage.TryDelete(previous);
            return ToSettings(actor.OrganizationId, setting);
        }

        public async Task<(FileStream Stream, string ContentType)> OpenQrAsync(OrganizationActor actor, CancellationToken ct = default)
        {
            var path = await _context.OrganizationPaymentSettings.AsNoTracking()
                .Where(x => x.OrganizationId == actor.OrganizationId)
                .Select(x => x.QrCodePath)
                .FirstOrDefaultAsync(ct);

            var stream = string.IsNullOrWhiteSpace(path) ? null : _storage.OpenRead(path);
            if (stream == null)
                throw NotFound("QR_NOT_FOUND", "No QR code has been uploaded.");

            return (stream, ContentTypeFor(path!));
        }

        private async Task<Organization> EnsureOrganizationAsync(OrganizationActor actor, CancellationToken ct) =>
            await _context.Organizations.AsNoTracking()
                .FirstOrDefaultAsync(o => o.OrganizationId == actor.OrganizationId, ct)
            ?? throw NotFound("ORGANIZATION_NOT_FOUND", "Organization not found.");

        private static OrganizationPaymentSettingsDto ToSettings(int organizationId, OrganizationPaymentSetting? setting) => new()
        {
            Id = setting?.Id ?? 0,
            OrganizationId = organizationId,
            UpiId = setting?.UpiId,
            UpiPayeeName = setting?.PayeeName,
            IsActive = setting?.IsActive ?? false,
            IsConfigured = !string.IsNullOrWhiteSpace(setting?.UpiId),
            HasQrImage = !string.IsNullOrWhiteSpace(setting?.QrCodePath),
            CreatedAt = setting?.CreatedAt,
            UpdatedAt = setting?.UpdatedAt
        };

        private static string ContentTypeFor(string path) =>
            Path.GetExtension(path).ToLowerInvariant() switch
            {
                ".png" => "image/png",
                ".webp" => "image/webp",
                _ => "image/jpeg"
            };

        // =========================================================
        // HELPERS
        // =========================================================

        private async Task SaveReviewAsync(CancellationToken ct)
        {
            try
            {
                await _context.SaveChangesAsync(ct);
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new EnrollmentWorkflowException(409, "ALREADY_PROCESSED",
                    "This record was just updated by someone else. Refresh and try again.");
            }
        }

        private async Task<bool> SendSetupEmailAsync(CourseEnrollment application, string token)
        {
            if (string.IsNullOrWhiteSpace(_options.FrontendBaseUrl))
            {
                _logger.LogWarning("PublicEnrollment:FrontendBaseUrl is not configured; setup email not sent.");
                return false;
            }

            // Token in the fragment so it never reaches server or proxy logs.
            // Frontend 17 reads the token from the query string (?token=).
            var link = Frontend($"/activate-account?token={Uri.EscapeDataString(token)}");
            return await TrySendStudentEmailAsync(application,
                $"Set your password — {application.Course.CourseName}",
                $"""
                <p>Hi {H(application.FirstName)},</p>
                <p>Your enrollment in <strong>{H(application.Course.CourseName)}</strong> has been approved.</p>
                <p>Create your password to activate your student account:</p>
                <p><a href="{H(link)}">{H(link)}</a></p>
                <p>This link can be used once and expires in {_options.PasswordSetupTokenLifetimeHours} hours.
                   If it expires, ask {H(application.Organization.OrganizationName)} to resend it.</p>
                <p>Your login email: <strong>{H(application.Email)}</strong></p>
                """);
        }

        private async Task<bool> SendExistingAccountEmailAsync(CourseEnrollment application)
        {
            var login = string.IsNullOrWhiteSpace(_options.FrontendBaseUrl) ? null : Frontend("/login");
            return await TrySendStudentEmailAsync(application,
                $"New course added — {application.Course.CourseName}",
                $"""
                <p>Hi {H(application.FirstName)},</p>
                <p>Your enrollment in <strong>{H(application.Course.CourseName)}</strong> has been approved and
                   added to your existing student account ({H(application.Email)}).</p>
                <p>{(login == null ? "Sign in to the student portal to start learning." : $"<a href=\"{H(login)}\">Sign in</a> to start learning.")}</p>
                <p>If you did not request this enrollment, contact {H(application.Organization.OrganizationName)}.</p>
                """);
        }

        private async Task<bool> TrySendStudentEmailAsync(CourseEnrollment application, string subject, string body)
        {
            try
            {
                await _emailService.SendEmailAsync(application.Email, subject, body);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Email '{Subject}' failed for enrollment {Id}", subject, application.CourseEnrollmentId);
                return false;
            }
        }

        private string Frontend(string path) => $"{_options.FrontendBaseUrl!.TrimEnd('/')}{path}";

        private static string RequireReason(string? reason)
        {
            var trimmed = reason?.Trim() ?? string.Empty;
            if (trimmed.Length < 5)
            {
                throw new EnrollmentValidationException(new()
                {
                    ["reason"] = new[] { "Please give a clear reason (at least 5 characters)." }
                });
            }
            return Truncate(trimmed, 500);
        }

        private static TEnum? ParseOrDefault<TEnum>(string? value, TEnum fallback, bool allowAll) where TEnum : struct, Enum
        {
            if (string.IsNullOrWhiteSpace(value)) return fallback;
            if (allowAll && value.Equals("all", StringComparison.OrdinalIgnoreCase)) return null;
            return Enum.TryParse<TEnum>(value, ignoreCase: true, out var parsed)
                ? parsed
                : throw new EnrollmentValidationException(new() { ["status"] = new[] { $"Unknown status '{value}'." } });
        }

        private static EnrollmentWorkflowException NotFound(string code, string message) => new(404, code, message);
        private static string H(string? s) => WebUtility.HtmlEncode(s ?? string.Empty);
        private static string Money(decimal value) => value.ToString("0.00", CultureInfo.InvariantCulture);
        private static string Truncate(string s, int max) => s.Length <= max ? s : s[..max];
    }
}
