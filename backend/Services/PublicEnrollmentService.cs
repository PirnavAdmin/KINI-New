using System.Globalization;
using System.Net;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.PublicEnrollment;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Helpers;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services
{
    public interface IPublicEnrollmentService
    {
        Task<PublicEnrollmentCreatedDto> CreateAsync(CreatePublicEnrollmentDto dto, CancellationToken ct = default);
        Task<PublicEnrollmentPaymentDetailsDto> GetPaymentDetailsAsync(int enrollmentId, string? token, CancellationToken ct = default);
        Task<(FileStream Stream, string ContentType)> OpenQrImageAsync(int enrollmentId, string? token, CancellationToken ct = default);
        Task<PaymentSubmittedDto> SubmitPaymentAsync(int enrollmentId, string? token, SubmitPaymentProofDto dto, CancellationToken ct = default);
        Task<PaymentSubmittedDto> SubmitPaymentAsync(int enrollmentId, string? token, SubmitPaymentProofDto dto, string? idempotencyKey, CancellationToken ct = default);

        // Guest checkout (Frontend 17, /api/v1/guest/enrollments)
        Task<GuestEnrollmentCreatedDto> CreateGuestAsync(GuestCreateEnrollmentDto dto, string? idempotencyKey, CancellationToken ct = default);
        Task<GuestPaymentInfoDto> GetGuestPaymentInfoAsync(int enrollmentId, string? token, CancellationToken ct = default);
        Task<GuestEnrollmentStatusDto> GetGuestStatusAsync(int enrollmentId, string? token, CancellationToken ct = default);
        Task<PublicEnrollmentStatusDto> GetStatusAsync(int enrollmentId, string? token, CancellationToken ct = default);
        Task<PublicEnrollmentDetailsDto> GetDetailsAsync(int enrollmentId, string? token, CancellationToken ct = default);
        Task<List<PublicPaymentSummaryDto>> GetPaymentHistoryAsync(int enrollmentId, string? token, CancellationToken ct = default);
        Task RequestAccessLinkAsync(RequestEnrollmentAccessLinkDto dto, CancellationToken ct = default);
    }

    public class PublicEnrollmentService : IPublicEnrollmentService
    {
        public const string PaymentProofCategory = "PaymentProofs";
        public const string UpiQrCategory = "UpiQrCodes";

        private static readonly Regex UtrPattern = new("^[A-Z0-9]{12,30}$", RegexOptions.Compiled);

        private readonly ApplicationDbContext _context;
        private readonly IPrivateFileStorage _storage;
        private readonly IEmailService _emailService;
        private readonly INotificationService _notificationService;
        private readonly PublicEnrollmentOptions _options;
        private readonly ILogger<PublicEnrollmentService> _logger;

        public PublicEnrollmentService(
            ApplicationDbContext context,
            IPrivateFileStorage storage,
            IEmailService emailService,
            INotificationService notificationService,
            IOptions<PublicEnrollmentOptions> options,
            ILogger<PublicEnrollmentService> logger)
        {
            _context = context;
            _storage = storage;
            _emailService = emailService;
            _notificationService = notificationService;
            _options = options.Value;
            _logger = logger;
        }

        // =========================================================
        // CREATE (anonymous)
        // =========================================================

        public Task<PublicEnrollmentCreatedDto> CreateAsync(
            CreatePublicEnrollmentDto dto,
            CancellationToken ct = default) =>
            CreateCoreAsync(dto, idempotencyKeyHash: null, termsAcceptedAt: null, ct);

        private async Task<PublicEnrollmentCreatedDto> CreateCoreAsync(
            CreatePublicEnrollmentDto dto,
            string? idempotencyKeyHash,
            DateTime? termsAcceptedAt,
            CancellationToken ct)
        {
            dto.ApplyStudentDetails();
            var email = dto.Email.Trim().ToLowerInvariant();
            var phone = NormalizePhone(dto.Phone);

            // Course, fee and organization come from the database only.
            var course = await _context.Courses
                .AsNoTracking()
                .Include(c => c.Organization)
                .FirstOrDefaultAsync(c =>
                    c.CourseId == dto.CourseId &&
                    c.Status && c.IsPublic && !c.IsArchived, ct)
                ?? throw new EnrollmentWorkflowException(404, "COURSE_NOT_FOUND",
                    "This course is not available for enrollment.");

            if (course.Price <= 0)
            {
                throw new EnrollmentWorkflowException(409, "COURSE_NOT_PURCHASABLE",
                    "This course has no fee set. Please contact the organization.");
            }

            // Batch is optional: guests cannot list batches before they have an
            // account, and the reviewer must choose the batch at approval.
            // A batch that is sent must belong to this course + organization and have seats.
            if (dto.BatchId.HasValue)
            {
                var batchOpen = await OpenBatches(course.CourseId, course.OrganizationId)
                    .AnyAsync(b => b.BatchId == dto.BatchId.Value, ct);
                if (!batchOpen)
                {
                    throw new EnrollmentWorkflowException(400, "INVALID_BATCH",
                        "The selected batch is not open for this course.");
                }
            }

            // Already an active student of this course?
            var alreadyEnrolled = await _context.StudentEnrollments
                .AsNoTracking()
                .AnyAsync(e =>
                    e.OrganizationId == course.OrganizationId &&
                    e.CourseId == course.CourseId &&
                    e.IsActive &&
                    !e.Student.IsDeleted &&
                    e.Student.Email == email, ct);

            if (alreadyEnrolled)
            {
                throw new EnrollmentWorkflowException(409, "ALREADY_ENROLLED",
                    "You are already enrolled in this course. Please sign in to the student portal.");
            }

            // An application for this course is already in progress.
            var inProgress = await _context.CourseEnrollments
                .AsNoTracking()
                .AnyAsync(a =>
                    a.OrganizationId == course.OrganizationId &&
                    a.CourseId == course.CourseId &&
                    a.Email == email &&
                    a.EnrollmentStatus != EnrollmentApplicationStatus.Rejected, ct);

            if (inProgress)
            {
                throw new EnrollmentWorkflowException(409, "ENROLLMENT_IN_PROGRESS",
                    "An enrollment for this course already exists for this email. " +
                    "Use \"Resend my enrollment link\" to continue it.");
            }

            var since = DateTime.UtcNow.AddDays(-1);
            var recentCount = await _context.CourseEnrollments
                .AsNoTracking()
                .CountAsync(a => a.Email == email && a.CreatedAt >= since, ct);

            if (recentCount >= _options.MaxApplicationsPerEmailPerDay)
            {
                throw new EnrollmentWorkflowException(429, "TOO_MANY_ENROLLMENTS",
                    "Too many enrollment requests for this email today. Please try again tomorrow.");
            }

            var accessToken = SecureTokenHelper.GenerateToken();

            var application = new CourseEnrollment
            {
                OrganizationId = course.OrganizationId,
                CourseId = course.CourseId,
                BatchId = dto.BatchId,
                FullName = $"{dto.FirstName.Trim()} {dto.LastName?.Trim()}".Trim(),
                Email = email,
                Phone = phone,
                HighestQualification = string.IsNullOrWhiteSpace(dto.HighestQualification) ? null : dto.HighestQualification.Trim(),
                InstitutionName = string.IsNullOrWhiteSpace(dto.InstitutionName) ? null : dto.InstitutionName.Trim(),
                Address = string.IsNullOrWhiteSpace(dto.Address) ? null : dto.Address.Trim(),
                FeeAmount = Math.Round(course.Price, 2),
                AccessTokenHash = SecureTokenHelper.Hash(accessToken),
                AccessTokenExpiresAt = DateTime.UtcNow.AddDays(_options.AccessTokenLifetimeDays),
                IdempotencyKeyHash = idempotencyKeyHash,
                TermsAcceptedAt = termsAcceptedAt,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.CourseEnrollments.Add(application);
            _context.EnrollmentApprovalHistories.Add(new EnrollmentApprovalHistory
            {
                CourseEnrollment = application,
                Action = "Created",
                Actor = "Public",
                ToStatus = EnrollmentWorkflow.StatusSnapshot(application),
                CreatedAt = DateTime.UtcNow
            });

            // Enrollment numbers are random; retry on the (unlikely) collision.
            for (var attempt = 1; ; attempt++)
            {
                application.EnrollmentNumber =
                    $"KEN-{DateTime.UtcNow:yyMMdd}-{SecureTokenHelper.RandomCode(6)}";
                application.PaymentReference = application.EnrollmentNumber;
                try
                {
                    await _context.SaveChangesAsync(ct);
                    break;
                }
                catch (DbUpdateException ex) when (EnrollmentWorkflow.IsDuplicateKey(ex) && attempt < 3)
                {
                    // A parallel request with the same Idempotency-Key won the race.
                    if (idempotencyKeyHash != null &&
                        await _context.CourseEnrollments.AsNoTracking().AnyAsync(a => a.IdempotencyKeyHash == idempotencyKeyHash, ct))
                    {
                        throw new EnrollmentWorkflowException(409, "DUPLICATE_REQUEST",
                            "This enrollment request is already being processed. Please retry in a moment.");
                    }
                    _logger.LogWarning("Enrollment number collision, retrying.");
                }
            }

            await SendAccessLinkEmailAsync(application, course.CourseName, course.Organization.OrganizationName, accessToken, isNew: true);
            application.Course = course;

            return new PublicEnrollmentCreatedDto
            {
                EnrollmentId = application.CourseEnrollmentId,
                EnrollmentNumber = application.EnrollmentNumber,
                StudentId = null,
                CourseId = course.CourseId,
                CourseName = course.CourseName,
                OrganizationId = course.OrganizationId,
                OrganizationName = course.Organization.OrganizationName,
                CourseFee = application.FeeAmount,
                Currency = application.Currency,
                AccessToken = accessToken,
                AccessTokenExpiresAt = application.AccessTokenExpiresAt!.Value,
                EnrollmentStatus = application.EnrollmentStatus.ToString(),
                PaymentStatus = application.PaymentStatus.ToString(),
                PaymentReference = PaymentReference(application),
                CreatedAt = application.CreatedAt
            };
        }

        // =========================================================
        // PAYMENT DETAILS (token)
        // =========================================================

        public async Task<PublicEnrollmentPaymentDetailsDto> GetPaymentDetailsAsync(
            int enrollmentId,
            string? token,
            CancellationToken ct = default)
        {
            var application = await LoadAuthorizedAsync(enrollmentId, token, tracking: false, ct);
            var organization = application.Organization;
            var attempts = application.Payments.Count;
            var upiConfigured = UpiAvailable(organization);

            return new PublicEnrollmentPaymentDetailsDto
            {
                EnrollmentId = application.CourseEnrollmentId,
                EnrollmentNumber = application.EnrollmentNumber,
                StudentName = application.FullName,
                CourseId = application.CourseId,
                CourseName = application.Course.CourseName,
                BatchName = application.Batch?.BatchName,
                FeeAmount = application.FeeAmount,
                Currency = application.Currency,
                OrganizationName = organization.OrganizationName,
                UpiConfigured = upiConfigured,
                UpiId = upiConfigured ? organization.PaymentSetting!.UpiId : null,
                UpiPayeeName = upiConfigured ? PayeeName(organization) : null,
                HasQrImage = upiConfigured && !string.IsNullOrWhiteSpace(organization.PaymentSetting!.QrCodePath),
                PaymentReference = PaymentReference(application),
                UpiPaymentUri = upiConfigured ? BuildUpiUri(application, organization) : null,
                Instructions = BuildInstructions(application, organization),
                EnrollmentStatus = application.EnrollmentStatus.ToString(),
                PaymentStatus = application.PaymentStatus.ToString(),
                CanSubmitPayment = CanSubmitPayment(application, attempts, upiConfigured),
                LastRejectionReason = application.Payments
                    .Where(p => p.Status == EnrollmentPaymentStatus.Rejected)
                    .OrderByDescending(p => p.SubmittedAt)
                    .Select(p => p.RejectionReason)
                    .FirstOrDefault(),
                RemainingAttempts = Math.Max(0, _options.MaxPaymentAttempts - attempts),
                MaxScreenshotBytes = _options.MaxScreenshotBytes
            };
        }

        public async Task<(FileStream Stream, string ContentType)> OpenQrImageAsync(
            int enrollmentId,
            string? token,
            CancellationToken ct = default)
        {
            var application = await LoadAuthorizedAsync(enrollmentId, token, tracking: false, ct);
            var path = application.Organization.PaymentSetting?.QrCodePath;

            var stream = string.IsNullOrWhiteSpace(path) || !UpiAvailable(application.Organization)
                ? null
                : _storage.OpenRead(path);
            if (stream == null)
            {
                throw new EnrollmentWorkflowException(404, "QR_NOT_FOUND",
                    "The organization has not uploaded a QR code.");
            }

            return (stream, ContentTypeFor(path!));
        }

        // =========================================================
        // SUBMIT PAYMENT PROOF (token)
        // =========================================================

        public Task<PaymentSubmittedDto> SubmitPaymentAsync(
            int enrollmentId,
            string? token,
            SubmitPaymentProofDto dto,
            CancellationToken ct = default) =>
            SubmitPaymentAsync(enrollmentId, token, dto, idempotencyKey: null, ct);

        public async Task<PaymentSubmittedDto> SubmitPaymentAsync(
            int enrollmentId,
            string? token,
            SubmitPaymentProofDto dto,
            string? idempotencyKey,
            CancellationToken ct = default)
        {
            var application = await LoadAuthorizedAsync(enrollmentId, token, tracking: true, ct);

            // Idempotent retry of the same proof: return the attempt already saved.
            var keyHash = HashIdempotencyKey(idempotencyKey);
            if (keyHash != null)
            {
                var replay = application.Payments.FirstOrDefault(p => p.IdempotencyKeyHash == keyHash);
                if (replay != null)
                    return ToSubmitted(application, replay);

                if (await _context.CoursePayments.AsNoTracking().AnyAsync(p => p.IdempotencyKeyHash == keyHash, ct))
                {
                    throw new EnrollmentWorkflowException(409, "IDEMPOTENCY_KEY_REUSED",
                        "This request key was already used for a different payment.");
                }
            }
            var attempts = application.Payments.Count;
            var upiConfigured = UpiAvailable(application.Organization);

            if (application.EnrollmentStatus == EnrollmentApplicationStatus.PendingPayment &&
                application.PaymentStatus == EnrollmentPaymentStatus.PendingVerification)
            {
                throw new EnrollmentWorkflowException(409, "PAYMENT_ALREADY_SUBMITTED",
                    "Your payment proof has already been submitted and is waiting for verification.");
            }

            if (application.EnrollmentStatus != EnrollmentApplicationStatus.PendingPayment)
            {
                throw new EnrollmentWorkflowException(409, "INVALID_STATUS_TRANSITION",
                    "Payment proof can no longer be submitted for this enrollment.");
            }

            if (!upiConfigured)
            {
                throw new EnrollmentWorkflowException(409, "PAYMENT_NOT_CONFIGURED",
                    "The organization has not set up UPI payments yet. Please contact them.");
            }

            if (attempts >= _options.MaxPaymentAttempts)
            {
                throw new EnrollmentWorkflowException(429, "TOO_MANY_PAYMENT_ATTEMPTS",
                    "The maximum number of payment submissions has been reached. Please contact the organization.");
            }

            // ---- Field validation ----
            var errors = new Dictionary<string, string[]>();

            var utr = Regex.Replace(dto.UtrNumber ?? string.Empty, @"\s+", string.Empty).ToUpperInvariant();
            if (!UtrPattern.IsMatch(utr))
                errors["utrNumber"] = new[] { "Enter the 12–30 character UTR / UPI transaction ID (letters and digits only)." };

            var nowUtc = DateTime.UtcNow;
            // Optional (the guest checkout sends none): defaults to today.
            var paymentDate = dto.PaymentDate ?? nowUtc;
            {
                var date = paymentDate.Date;
                if (date > nowUtc.Date.AddDays(1))
                    errors["paymentDate"] = new[] { "Payment date cannot be in the future." };
                else if (date < application.CreatedAt.Date.AddDays(-1) ||
                         date < nowUtc.Date.AddDays(-_options.MaxPaymentAgeDays))
                    errors["paymentDate"] = new[] { "Payment date must be on or after the enrollment date." };
            }

            if (dto.EffectiveAmount is { } amountPaid && Math.Round(amountPaid, 2) != application.FeeAmount)
                errors[dto.AmountPaid.HasValue ? "amountPaid" : "amount"] = new[] { $"The amount paid must be exactly ₹{application.FeeAmount.ToString("0.00", CultureInfo.InvariantCulture)}." };

            if (!string.IsNullOrWhiteSpace(dto.PaymentMethod) &&
                !string.Equals(dto.PaymentMethod.Trim(), "UPI", StringComparison.OrdinalIgnoreCase))
                errors["paymentMethod"] = new[] { "Only UPI payments are accepted." };

            var screenshot = dto.EffectiveScreenshot;
            if (screenshot == null || screenshot.Length == 0)
                errors["screenshot"] = new[] { "Please upload the payment screenshot." };

            if (errors.Count > 0)
                throw new EnrollmentValidationException(errors);

            // ---- Duplicate UTR: a UTR can be used once, ever (unique index) ----
            var utrInUse = await _context.CoursePayments
                .AsNoTracking()
                .AnyAsync(p => p.UtrNumber == utr, ct);

            if (utrInUse)
            {
                throw new EnrollmentWorkflowException(409, "DUPLICATE_UTR",
                    "This UTR number has already been submitted.");
            }

            // ---- Store screenshot privately ----
            var (image, imageError) = await _storage.SaveImageAsync(
                screenshot!, PaymentProofCategory, application.OrganizationId, _options.MaxScreenshotBytes, ct);

            if (image == null)
                throw new EnrollmentValidationException(new() { ["screenshot"] = new[] { imageError! } });

            try
            {
                var screenshotReused = await _context.CoursePayments
                    .AsNoTracking()
                    .AnyAsync(p =>
                        p.ScreenshotSha256 == image.Sha256 &&
                        p.CourseEnrollmentId != application.CourseEnrollmentId &&
                        p.Status != EnrollmentPaymentStatus.Rejected, ct);

                if (screenshotReused)
                {
                    throw new EnrollmentWorkflowException(409, "DUPLICATE_SCREENSHOT",
                        "This screenshot has already been used for another enrollment.");
                }

                var payment = new CoursePayment
                {
                    CourseEnrollmentId = application.CourseEnrollmentId,
                    Amount = application.FeeAmount,
                    PaymentMethod = "UPI",
                    UtrNumber = utr,
                    PaymentDate = paymentDate.Date,
                    ScreenshotStoragePath = image.StoragePath,
                    ScreenshotContentType = image.ContentType,
                    ScreenshotSizeBytes = image.SizeBytes,
                    ScreenshotSha256 = image.Sha256,
                    Status = EnrollmentPaymentStatus.PendingVerification,
                    SubmittedAt = nowUtc,
                    IdempotencyKeyHash = keyHash
                };
                payment.CourseEnrollment = application;

                application.Payments.Add(payment);

                // Submission never verifies the payment, and the enrollment
                // stays PendingPayment until the organization checks its bank.
                EnrollmentWorkflow.Transition(_context, application,
                    action: "PaymentSubmitted",
                    actor: "Public",
                    paymentStatus: EnrollmentPaymentStatus.PendingVerification);

                // Single SaveChanges = atomic. The concurrency stamp blocks a
                // parallel duplicate submit; the unique ActiveUtr index blocks
                // a racing duplicate UTR.
                await _context.SaveChangesAsync(ct);
            }
            catch (DbUpdateConcurrencyException)
            {
                _storage.TryDelete(image.StoragePath);
                throw new EnrollmentWorkflowException(409, "DUPLICATE_SUBMISSION",
                    "This payment was already submitted. Refresh to see the latest status.");
            }
            catch (DbUpdateException ex) when (EnrollmentWorkflow.IsDuplicateKey(ex))
            {
                _storage.TryDelete(image.StoragePath);
                throw new EnrollmentWorkflowException(409, "DUPLICATE_UTR",
                    "This UTR number has already been submitted.");
            }
            catch
            {
                _storage.TryDelete(image.StoragePath);
                throw;
            }

            await NotifyOrganizationAsync(application);

            var submitted = application.Payments.OrderByDescending(p => p.SubmittedAt).First();
            return ToSubmitted(application, submitted);
        }

        private static PaymentSubmittedDto ToSubmitted(CourseEnrollment application, CoursePayment payment) => new()
        {
            PaymentId = payment.CoursePaymentId,
            EnrollmentId = application.CourseEnrollmentId,
            EnrollmentNumber = application.EnrollmentNumber,
            UtrNumber = payment.UtrNumber,
            Amount = payment.Amount,
            PaymentDate = payment.PaymentDate,
            PaymentStatus = payment.Status.ToString(),
            EnrollmentStatus = application.EnrollmentStatus.ToString(),
            Stage = EnrollmentWorkflow.Stage(application),
            NextAction = EnrollmentWorkflow.NextAction(application),
            Message = "Payment Submitted – Waiting for Organization Verification",
            SubmittedAt = payment.SubmittedAt
        };

        // =========================================================
        // GUEST CHECKOUT (Frontend 17)
        // =========================================================

        public async Task<GuestEnrollmentCreatedDto> CreateGuestAsync(
            GuestCreateEnrollmentDto dto,
            string? idempotencyKey,
            CancellationToken ct = default)
        {
            if (!dto.AcceptedTerms)
                throw new EnrollmentValidationException(new() { ["acceptedTerms"] = new[] { "Please accept the terms to continue." } });

            dto.ApplyStudentDetails();
            var keyHash = HashIdempotencyKey(idempotencyKey);

            if (keyHash != null)
            {
                var existing = await _context.CourseEnrollments
                    .Include(a => a.Course)
                    .FirstOrDefaultAsync(a => a.IdempotencyKeyHash == keyHash, ct);

                if (existing != null)
                {
                    var email = dto.Email.Trim().ToLowerInvariant();
                    if (existing.CourseId != dto.CourseId || existing.Email != email)
                    {
                        throw new EnrollmentWorkflowException(409, "IDEMPOTENCY_KEY_REUSED",
                            "This request key was already used for a different enrollment.");
                    }

                    // Replay after a lost response: the original token was never
                    // received, so issue a fresh one for the same enrollment.
                    var replayToken = SecureTokenHelper.GenerateToken();
                    existing.AccessTokenHash = SecureTokenHelper.Hash(replayToken);
                    existing.AccessTokenExpiresAt = DateTime.UtcNow.AddDays(_options.AccessTokenLifetimeDays);
                    existing.UpdatedAt = DateTime.UtcNow;
                    existing.ConcurrencyStamp = Guid.NewGuid().ToString();
                    _context.EnrollmentApprovalHistories.Add(new EnrollmentApprovalHistory
                    {
                        CourseEnrollmentId = existing.CourseEnrollmentId,
                        Action = "CreateReplayed",
                        Actor = "Public",
                        FromStatus = EnrollmentWorkflow.StatusSnapshot(existing),
                        ToStatus = EnrollmentWorkflow.StatusSnapshot(existing),
                        CreatedAt = DateTime.UtcNow
                    });
                    await _context.SaveChangesAsync(ct);
                    return ToGuestCreated(existing, replayToken);
                }
            }

            var created = await CreateCoreAsync(dto, keyHash, DateTime.UtcNow, ct);
            var application = await _context.CourseEnrollments.AsNoTracking()
                .Include(a => a.Course)
                .FirstAsync(a => a.CourseEnrollmentId == created.EnrollmentId, ct);
            return ToGuestCreated(application, created.AccessToken);
        }

        private static GuestEnrollmentCreatedDto ToGuestCreated(CourseEnrollment application, string accessToken) => new()
        {
            EnrollmentId = application.CourseEnrollmentId,
            EnrollmentNumber = application.EnrollmentNumber,
            AccessToken = accessToken,
            AccessTokenExpiresAt = application.AccessTokenExpiresAt ?? DateTime.UtcNow,
            CourseId = application.CourseId,
            CourseName = application.Course.CourseName,
            Amount = application.FeeAmount,
            Currency = application.Currency,
            EnrollmentStatus = application.EnrollmentStatus.ToString(),
            PaymentStatus = application.PaymentStatus.ToString(),
            CreatedAt = application.CreatedAt
        };

        public async Task<GuestPaymentInfoDto> GetGuestPaymentInfoAsync(
            int enrollmentId,
            string? token,
            CancellationToken ct = default)
        {
            var application = await LoadAuthorizedAsync(enrollmentId, token, tracking: false, ct);
            var organization = application.Organization;
            var upi = UpiAvailable(organization);

            return new GuestPaymentInfoDto
            {
                EnrollmentId = application.CourseEnrollmentId,
                EnrollmentNumber = application.EnrollmentNumber,
                CourseName = application.Course.CourseName,
                OrganizationName = organization.OrganizationName,
                PayeeName = upi ? PayeeName(organization) : null,
                UpiId = upi ? organization.PaymentSetting!.UpiId : null,
                QrCodeUrl = upi ? await QrDataUriAsync(organization.PaymentSetting!.QrCodePath, ct) : null,
                QrPayload = upi ? BuildUpiUri(application, organization) : null,
                Amount = application.FeeAmount,
                Currency = application.Currency,
                PaymentReference = PaymentReference(application),
                PaymentStatus = application.PaymentStatus.ToString(),
                CanSubmitPayment = CanSubmitPayment(application, application.Payments.Count, upi)
            };
        }

        /// <summary>The QR image inlined as a data: URI so no token ever goes into a URL.</summary>
        private async Task<string?> QrDataUriAsync(string? path, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(path))
                return null;
            await using var stream = _storage.OpenRead(path);
            if (stream == null)
                return null;
            using var buffer = new MemoryStream();
            await stream.CopyToAsync(buffer, ct);
            return $"data:{ContentTypeFor(path)};base64,{Convert.ToBase64String(buffer.ToArray())}";
        }

        public async Task<GuestEnrollmentStatusDto> GetGuestStatusAsync(
            int enrollmentId,
            string? token,
            CancellationToken ct = default)
        {
            var application = await LoadAuthorizedAsync(enrollmentId, token, tracking: false, ct);
            var latest = application.Payments.OrderByDescending(p => p.SubmittedAt).FirstOrDefault();
            var approved = application.EnrollmentStatus == EnrollmentApplicationStatus.Approved &&
                           application.PaymentStatus == EnrollmentPaymentStatus.Verified;

            return new GuestEnrollmentStatusDto
            {
                Enrollment = new GuestEnrollmentSummaryDto
                {
                    EnrollmentId = application.CourseEnrollmentId,
                    EnrollmentNumber = application.EnrollmentNumber,
                    CourseId = application.CourseId,
                    CourseName = application.Course.CourseName,
                    EnrollmentStatus = application.EnrollmentStatus.ToString(),
                    PaymentStatus = application.PaymentStatus.ToString(),
                    AccountStatus = application.AccountStatus.ToString(),
                    Amount = application.FeeAmount,
                    Currency = application.Currency,
                    CreatedAt = application.CreatedAt,
                    ApprovedAt = application.EnrollmentStatus == EnrollmentApplicationStatus.Approved ? application.ReviewedAt : null,
                    RejectionReason = application.EnrollmentStatus == EnrollmentApplicationStatus.Rejected ? application.RejectionReason : null
                },
                Payment = latest == null ? null : new GuestPaymentSummaryDto
                {
                    PaymentId = latest.CoursePaymentId,
                    Status = latest.Status.ToString(),
                    UtrNumber = latest.UtrNumber,
                    Amount = latest.Amount,
                    SubmittedAt = latest.SubmittedAt,
                    VerifiedAt = latest.Status == EnrollmentPaymentStatus.Verified ? latest.ReviewedAt : null,
                    RejectionReason = latest.Status == EnrollmentPaymentStatus.Rejected ? latest.RejectionReason : null
                },
                AccountReady = approved && application.AccountStatus == EnrollmentAccountStatus.Active,
                RequiresPasswordSetup = approved && application.AccountStatus == EnrollmentAccountStatus.PendingSetup,
                Stage = EnrollmentWorkflow.Stage(application),
                NextAction = EnrollmentWorkflow.NextAction(application),
                CanSubmitPayment = CanSubmitPayment(application, application.Payments.Count, UpiAvailable(application.Organization))
            };
        }

        private static string? HashIdempotencyKey(string? key)
        {
            if (string.IsNullOrWhiteSpace(key))
                return null;
            key = key.Trim();
            if (key.Length > 200)
                throw new EnrollmentValidationException(new() { ["idempotencyKey"] = new[] { "The Idempotency-Key header is too long." } });
            return SecureTokenHelper.Hash(key);
        }

        // =========================================================
        // STATUS (token)
        // =========================================================

        public async Task<PublicEnrollmentStatusDto> GetStatusAsync(
            int enrollmentId,
            string? token,
            CancellationToken ct = default)
        {
            var application = await LoadAuthorizedAsync(enrollmentId, token, tracking: false, ct);
            var stage = EnrollmentWorkflow.Stage(application);
            var latest = application.Payments.OrderByDescending(p => p.SubmittedAt).FirstOrDefault();

            return new PublicEnrollmentStatusDto
            {
                EnrollmentId = application.CourseEnrollmentId,
                EnrollmentNumber = application.EnrollmentNumber,
                StudentName = application.FullName,
                CourseName = application.Course.CourseName,
                OrganizationName = application.Organization.OrganizationName,
                FeeAmount = application.FeeAmount,
                Currency = application.Currency,
                PaymentReference = PaymentReference(application),
                EnrollmentStatus = application.EnrollmentStatus.ToString(),
                PaymentStatus = application.PaymentStatus.ToString(),
                AccountStatus = application.AccountStatus.ToString(),
                Stage = stage,
                Message = EnrollmentWorkflow.StageMessage(stage),
                NextAction = EnrollmentWorkflow.NextAction(application),
                CanSubmitPayment = CanSubmitPayment(application, application.Payments.Count,
                    UpiAvailable(application.Organization)),
                PaymentRejectionReason = application.PaymentStatus == EnrollmentPaymentStatus.Rejected
                    ? latest?.RejectionReason
                    : null,
                EnrollmentRejectionReason = application.EnrollmentStatus == EnrollmentApplicationStatus.Rejected
                    ? application.RejectionReason
                    : null,
                LatestPayment = latest == null ? null : ToSummary(latest),
                UpdatedAt = application.UpdatedAt ?? application.CreatedAt
            };
        }

        // =========================================================
        // DETAILS + PAYMENT HISTORY (token) — the applicant's own data only
        // =========================================================

        public async Task<PublicEnrollmentDetailsDto> GetDetailsAsync(
            int enrollmentId,
            string? token,
            CancellationToken ct = default)
        {
            var application = await LoadAuthorizedAsync(enrollmentId, token, tracking: false, ct);

            return new PublicEnrollmentDetailsDto
            {
                EnrollmentId = application.CourseEnrollmentId,
                EnrollmentNumber = application.EnrollmentNumber,
                Student = new PublicEnrollmentStudentDto
                {
                    StudentId = application.StudentId,
                    FullName = application.FullName,
                    Email = application.Email,
                    Mobile = application.Phone,
                    Qualification = application.HighestQualification ?? string.Empty,
                    CollegeName = application.InstitutionName,
                    Address = application.Address
                },
                Course = new PublicEnrollmentCourseDto
                {
                    CourseId = application.CourseId,
                    CourseName = application.Course.CourseName,
                    CourseFee = application.FeeAmount,
                    Currency = application.Currency,
                    BatchId = application.BatchId,
                    BatchName = application.Batch?.BatchName
                },
                Organization = new PublicEnrollmentOrganizationDto
                {
                    OrganizationId = application.OrganizationId,
                    OrganizationName = application.Organization.OrganizationName
                },
                PaymentReference = PaymentReference(application),
                PaymentStatus = application.PaymentStatus.ToString(),
                EnrollmentStatus = application.EnrollmentStatus.ToString(),
                AccountStatus = application.AccountStatus.ToString(),
                Stage = EnrollmentWorkflow.Stage(application),
                NextAction = EnrollmentWorkflow.NextAction(application),
                CreatedAt = application.CreatedAt,
                UpdatedAt = application.UpdatedAt ?? application.CreatedAt
            };
        }

        public async Task<List<PublicPaymentSummaryDto>> GetPaymentHistoryAsync(
            int enrollmentId,
            string? token,
            CancellationToken ct = default)
        {
            var application = await LoadAuthorizedAsync(enrollmentId, token, tracking: false, ct);
            return application.Payments
                .OrderByDescending(p => p.SubmittedAt)
                .Select(ToSummary)
                .ToList();
        }

        /// <summary>Student-safe view of one payment attempt (no file paths or hashes).</summary>
        public static PublicPaymentSummaryDto ToSummary(CoursePayment payment) => new()
        {
            PaymentId = payment.CoursePaymentId,
            EnrollmentId = payment.CourseEnrollmentId,
            UtrNumber = payment.UtrNumber,
            Amount = payment.Amount,
            PaymentDate = payment.PaymentDate,
            SubmittedAt = payment.SubmittedAt,
            Status = payment.Status.ToString(),
            RejectionReason = payment.RejectionReason,
            Remarks = payment.RejectionReason ?? payment.ReviewNote,
            VerifiedAt = payment.Status == EnrollmentPaymentStatus.Verified ? payment.ReviewedAt : null,
            VerifiedBy = payment.Status == EnrollmentPaymentStatus.Verified ? "Organization" : null
        };

        // =========================================================
        // RESEND ACCESS LINK (anonymous; never reveals whether it matched)
        // =========================================================

        public async Task RequestAccessLinkAsync(
            RequestEnrollmentAccessLinkDto dto,
            CancellationToken ct = default)
        {
            var email = dto.Email.Trim().ToLowerInvariant();
            var number = dto.EnrollmentNumber.Trim().ToUpperInvariant();

            var application = await _context.CourseEnrollments
                .Include(a => a.Course)
                .Include(a => a.Organization)
                .FirstOrDefaultAsync(a => a.EnrollmentNumber == number && a.Email == email, ct);

            if (application == null)
                return;

            var accessToken = SecureTokenHelper.GenerateToken();
            application.AccessTokenHash = SecureTokenHelper.Hash(accessToken);
            application.AccessTokenExpiresAt = DateTime.UtcNow.AddDays(_options.AccessTokenLifetimeDays);
            application.UpdatedAt = DateTime.UtcNow;
            application.ConcurrencyStamp = Guid.NewGuid().ToString();

            _context.EnrollmentApprovalHistories.Add(new EnrollmentApprovalHistory
            {
                CourseEnrollmentId = application.CourseEnrollmentId,
                Action = "AccessLinkReissued",
                Actor = "Public",
                FromStatus = EnrollmentWorkflow.StatusSnapshot(application),
                ToStatus = EnrollmentWorkflow.StatusSnapshot(application),
                CreatedAt = DateTime.UtcNow
            });

            try
            {
                await _context.SaveChangesAsync(ct);
            }
            catch (DbUpdateConcurrencyException)
            {
                return; // a concurrent change won; the student can request again
            }

            await SendAccessLinkEmailAsync(application, application.Course.CourseName,
                application.Organization.OrganizationName, accessToken, isNew: false);
        }

        // =========================================================
        // HELPERS
        // =========================================================

        private IQueryable<Batch> OpenBatches(int courseId, int organizationId) =>
            _context.Batches.AsNoTracking().Where(b =>
                b.CourseId == courseId &&
                b.OrganizationId == organizationId &&
                (b.Status == BatchStatus.Upcoming || b.Status == BatchStatus.Active) &&
                b.EnrolledStudents < b.Capacity);

        /// <summary>
        /// Loads an application only when the enrollment-specific token matches.
        /// A wrong token or unknown id both return 404, so ids cannot be probed.
        /// </summary>
        private async Task<CourseEnrollment> LoadAuthorizedAsync(
            int enrollmentId,
            string? token,
            bool tracking,
            CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                throw new EnrollmentWorkflowException(401, "ENROLLMENT_TOKEN_REQUIRED",
                    "Your enrollment link is missing its access token.");
            }

            IQueryable<CourseEnrollment> query = _context.CourseEnrollments
                .Include(a => a.Course)
                .Include(a => a.Organization).ThenInclude(o => o.PaymentSetting)
                .Include(a => a.Batch)
                .Include(a => a.Payments);

            if (!tracking)
                query = query.AsNoTracking();

            var application = await query.FirstOrDefaultAsync(a => a.CourseEnrollmentId == enrollmentId, ct);

            if (application == null ||
                string.IsNullOrEmpty(application.AccessTokenHash) ||
                !SecureTokenHelper.Matches(token, application.AccessTokenHash))
            {
                throw new EnrollmentWorkflowException(404, "ENROLLMENT_NOT_FOUND",
                    "Enrollment not found. Check that you opened the full link from your email.");
            }

            if (application.AccessTokenExpiresAt is not DateTime expiresAt || expiresAt <= DateTime.UtcNow)
            {
                throw new EnrollmentWorkflowException(401, "ENROLLMENT_TOKEN_EXPIRED",
                    "This enrollment link has expired. Request a new link to continue.");
            }

            return application;
        }

        private bool CanSubmitPayment(CourseEnrollment application, int attempts, bool upiConfigured) =>
            upiConfigured &&
            application.EnrollmentStatus == EnrollmentApplicationStatus.PendingPayment &&
            application.PaymentStatus != EnrollmentPaymentStatus.PendingVerification &&
            attempts < _options.MaxPaymentAttempts;

        /// <summary>UPI ID saved and payments switched on by the organization.</summary>
        public static bool UpiAvailable(Organization organization) =>
            organization.PaymentSetting is { IsActive: true } setting && !string.IsNullOrWhiteSpace(setting.UpiId);

        private static string PayeeName(Organization organization) =>
            string.IsNullOrWhiteSpace(organization.PaymentSetting?.PayeeName)
                ? organization.OrganizationName
                : organization.PaymentSetting.PayeeName;

        /// <summary>
        /// Unique per enrollment: the enrollment number (unique index) is the
        /// UPI transaction reference, so a bank credit can be matched to it.
        /// </summary>
        public static string PaymentReference(CourseEnrollment application) => application.EnrollmentNumber;

        private static string BuildUpiUri(CourseEnrollment application, Organization organization)
        {
            var amount = application.FeeAmount.ToString("0.00", CultureInfo.InvariantCulture);
            var payee = PayeeName(organization);
            return "upi://pay" +
                   $"?pa={Uri.EscapeDataString(organization.PaymentSetting!.UpiId.Trim())}" +
                   $"&pn={Uri.EscapeDataString(payee)}" +
                   $"&am={amount}" +
                   "&cu=INR" +
                   $"&tr={Uri.EscapeDataString(PaymentReference(application))}" +
                   $"&tn={Uri.EscapeDataString(PaymentReference(application))}";
        }

        private static List<string> BuildInstructions(CourseEnrollment application, Organization organization)
        {
            var amount = application.FeeAmount.ToString("0.00", CultureInfo.InvariantCulture);
            return new List<string>
            {
                "Open any UPI app (Google Pay, PhonePe, Paytm, BHIM or your bank app).",
                $"Scan the QR code or pay to UPI ID {organization.PaymentSetting?.UpiId}.",
                $"Pay exactly ₹{amount}. Add {application.EnrollmentNumber} in the payment note if your app allows it.",
                "After paying, note the 12-digit UTR / UPI reference number from the payment receipt.",
                "Enter the UTR and payment date below and upload a clear screenshot of the successful payment.",
                "The organization will verify the payment against its bank statement before approving your enrollment."
            };
        }

        private static string NormalizePhone(string phone)
        {
            var digits = new string(phone.Where(char.IsDigit).ToArray());
            return digits.Length > 10 ? digits[^10..] : digits;
        }

        private static string ContentTypeFor(string path) =>
            Path.GetExtension(path).ToLowerInvariant() switch
            {
                ".png" => "image/png",
                ".webp" => "image/webp",
                _ => "image/jpeg"
            };

        private async Task NotifyOrganizationAsync(CourseEnrollment application)
        {
            try
            {
                await _notificationService.CreateOrganizationNotificationAsync(
                    application.OrganizationId,
                    "Payment proof submitted",
                    $"{application.FullName} submitted UPI payment proof for " +
                    $"{application.Course.CourseName} ({application.EnrollmentNumber}). Verify it against your bank statement.",
                    NotificationType.PaymentPending,
                    application.CourseEnrollmentId,
                    ReferenceType.Payment);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Organization notification failed for enrollment {Id}", application.CourseEnrollmentId);
            }
        }

        private async Task SendAccessLinkEmailAsync(
            CourseEnrollment application,
            string courseName,
            string organizationName,
            string accessToken,
            bool isNew)
        {
            if (string.IsNullOrWhiteSpace(_options.FrontendBaseUrl))
            {
                _logger.LogWarning("PublicEnrollment:FrontendBaseUrl is not configured; enrollment link email skipped.");
                return;
            }

            // Frontend 17 private status link: /enrollment#enrollmentStatus=[...]. The
            // token stays in the URL fragment, which browsers never send to servers.
            var record = new[]
            {
                new
                {
                    enrollmentId = application.CourseEnrollmentId,
                    courseId = application.CourseId,
                    courseName,
                    price = application.FeeAmount,
                    guestAccessToken = accessToken
                }
            };
            var link = $"{_options.FrontendBaseUrl.TrimEnd('/')}/enrollment#enrollmentStatus=" +
                       Uri.EscapeDataString(System.Text.Json.JsonSerializer.Serialize(record));
            var h = (string s) => WebUtility.HtmlEncode(s);

            var body = $"""
                <p>Hi {h(application.FirstName)},</p>
                <p>{(isNew ? "Thank you for enrolling in" : "Here is a new link for your enrollment in")}
                   <strong>{h(courseName)}</strong> with {h(organizationName)}.</p>
                <p>Enrollment number: <strong>{h(application.EnrollmentNumber)}</strong><br/>
                   Course fee: <strong>₹{application.FeeAmount.ToString("0.00", CultureInfo.InvariantCulture)}</strong></p>
                <p>Use this private link to pay, upload your payment proof and track your enrollment:</p>
                <p><a href="{h(link)}">{h(link)}</a></p>
                <p>The link is valid until {application.AccessTokenExpiresAt:dd MMM yyyy} (UTC). Do not share it.</p>
                <p>— {h(organizationName)} via Kini EdX Hub</p>
                """;

            try
            {
                await _emailService.SendEmailAsync(
                    application.Email,
                    $"Your enrollment {application.EnrollmentNumber} — {courseName}",
                    body);
            }
            catch (Exception ex)
            {
                // The enrollment is saved; the student also has the link in the browser.
                _logger.LogWarning(ex, "Enrollment link email failed for enrollment {Id}", application.CourseEnrollmentId);
            }
        }
    }

    /// <summary>Field-level validation errors, returned as a 400 ValidationProblem.</summary>
    public class EnrollmentValidationException : Exception
    {
        public Dictionary<string, string[]> Errors { get; }

        public EnrollmentValidationException(Dictionary<string, string[]> errors)
            : base("One or more validation errors occurred.")
        {
            Errors = errors;
        }
    }
}
