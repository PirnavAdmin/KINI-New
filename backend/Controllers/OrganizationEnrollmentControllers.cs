using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.PublicEnrollment;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    /// <summary>Shared error mapping + actor resolution for the organization enrollment controllers.</summary>
    [EnrollmentApiValidation]
    public abstract class OrganizationEnrollmentControllerBase : ControllerBase
    {
        protected readonly IOrganizationEnrollmentService Service;
        private readonly IOrganizationActorResolver _actorResolver;

        protected OrganizationEnrollmentControllerBase(
            IOrganizationEnrollmentService service,
            IOrganizationActorResolver actorResolver)
        {
            Service = service;
            _actorResolver = actorResolver;
        }

        protected CancellationToken Aborted => HttpContext.RequestAborted;

        /// <summary>Resolves the caller's organization from the DB, then runs the action.</summary>
        protected async Task<IActionResult> Run(Func<OrganizationActor, Task<IActionResult>> action)
        {
            try
            {
                var actor = await _actorResolver.ResolveAsync(User, Aborted);
                return await action(actor);
            }
            catch (Exception ex) when (ex is EnrollmentValidationException or EnrollmentWorkflowException)
            {
                return EnrollmentApi.FromException(ex);
            }
        }

        /// <summary>Accepts the requirement doc's ?limit= as well as ?pageSize=.</summary>
        protected static int PageSize(int? pageSize, int? limit) => limit ?? pageSize ?? 20;
    }

    // =====================================================================
    // PAYMENT VERIFICATION  — permission module "Payment Verification"
    // Both route prefixes serve the same actions (the second is the
    // requirement document's path); nothing is duplicated.
    // =====================================================================

    [ApiController]
    [Authorize]
    [Route("api/v1/organization/enrollment-payments")]
    [Route("api/v1/organization/payments")]
    public class EnrollmentPaymentVerificationController : OrganizationEnrollmentControllerBase
    {
        public EnrollmentPaymentVerificationController(
            IOrganizationEnrollmentService service,
            IOrganizationActorResolver actorResolver)
            : base(service, actorResolver) { }

        // GET ?status|paymentStatus=PendingVerification|Verified|Rejected|all&search=&page=&limit=
        // Without a status: /organization/payments lists all (requirement doc),
        // /organization/enrollment-payments lists the verification queue.
        [HttpGet]
        [HasPermission("Payment Verification", "view")]
        public Task<IActionResult> GetPayments(
            [FromQuery] string? status,
            [FromQuery] string? paymentStatus,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int? pageSize = null,
            [FromQuery] int? limit = null,
            [FromQuery] string? sort = null)
        {
            var filter = !string.IsNullOrWhiteSpace(status) ? status : paymentStatus;
            if (string.IsNullOrWhiteSpace(filter) &&
                Request.Path.StartsWithSegments("/api/v1/organization/payments", StringComparison.OrdinalIgnoreCase))
            {
                filter = "all";
            }

            return Run(async actor => Ok(EnrollmentApi.Paged("Organization payments retrieved successfully",
                await Service.GetPaymentsAsync(actor, filter, search, page, PageSize(pageSize, limit), Aborted,
                    newestFirst: string.Equals(sort, "newest", StringComparison.OrdinalIgnoreCase)))));
        }

        // GET pending — the verification queue
        [HttpGet("pending")]
        [HasPermission("Payment Verification", "view")]
        public Task<IActionResult> GetPending(
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int? pageSize = null,
            [FromQuery] int? limit = null) =>
            Run(async actor => Ok(EnrollmentApi.Paged("Pending payments retrieved successfully",
                await Service.GetPaymentsAsync(actor, "PendingVerification", search, page, PageSize(pageSize, limit), Aborted))));

        [HttpGet("{paymentId:int}")]
        [HasPermission("Payment Verification", "view")]
        public Task<IActionResult> GetPayment(int paymentId) =>
            Run(async actor => Ok(EnrollmentApi.Success("Payment details retrieved successfully",
                await Service.GetPaymentAsync(actor, paymentId, Aborted))));

        // Authorized screenshot preview (never a public URL).
        [HttpGet("{paymentId:int}/screenshot")]
        [HasPermission("Payment Verification", "view")]
        public Task<IActionResult> GetScreenshot(int paymentId) =>
            Run(async actor =>
            {
                var (stream, contentType) = await Service.OpenScreenshotAsync(actor, paymentId, Aborted);
                Response.Headers.CacheControl = "private, no-store";
                Response.Headers["X-Content-Type-Options"] = "nosniff";
                return File(stream, contentType);
            });

        [HttpPost("{paymentId:int}/verify")]
        [HttpPut("{paymentId:int}/verify")]
        [HasPermission("Payment Verification", "edit")]
        public Task<IActionResult> Verify(int paymentId, [FromBody] VerifyEnrollmentPaymentDto dto) =>
            Run(async actor => Ok(EnrollmentApi.Success("Payment verified successfully. Student moved to approval queue.",
                await Service.VerifyPaymentAsync(actor, paymentId, dto, Aborted))));

        [HttpPost("{paymentId:int}/reject")]
        [HttpPut("{paymentId:int}/reject")]
        [HasPermission("Payment Verification", "edit")]
        public Task<IActionResult> Reject(int paymentId, [FromBody] RejectWithReasonDto dto) =>
            Run(async actor => Ok(EnrollmentApi.Success("Payment rejected successfully",
                await Service.RejectPaymentAsync(actor, paymentId, dto.EffectiveReason, Aborted))));
    }

    // =====================================================================
    // ENROLLMENT APPROVAL — permission module "Enrollment Approval"
    // =====================================================================

    [ApiController]
    [Authorize]
    [Route("api/v1/organization/enrollment-approvals")]
    [Route("api/v1/organization/enrollments")]
    public class EnrollmentApprovalController : OrganizationEnrollmentControllerBase
    {
        public EnrollmentApprovalController(
            IOrganizationEnrollmentService service,
            IOrganizationActorResolver actorResolver)
            : base(service, actorResolver) { }

        // GET ?status=PendingApproval|Approved|Rejected|all
        [HttpGet]
        [HasPermission("Enrollment Approval", "view")]
        public Task<IActionResult> GetApprovals(
            [FromQuery] string? status,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int? pageSize = null,
            [FromQuery] int? limit = null) =>
            Run(async actor => Ok(EnrollmentApi.Paged("Enrollments retrieved successfully",
                await Service.GetApprovalsAsync(actor, status, search, page, PageSize(pageSize, limit), Aborted))));

        // Only PaymentStatus = Verified AND EnrollmentStatus = PendingApproval.
        [HttpGet("pending-approval")]
        [HasPermission("Enrollment Approval", "view")]
        public Task<IActionResult> GetPendingApproval(
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int? pageSize = null,
            [FromQuery] int? limit = null) =>
            Run(async actor => Ok(EnrollmentApi.Paged("Pending student approvals retrieved successfully",
                await Service.GetApprovalsAsync(actor, "PendingApproval", search, page, PageSize(pageSize, limit), Aborted))));

        [HttpGet("approved")]
        [HasPermission("Enrollment Approval", "view")]
        public Task<IActionResult> GetApproved(
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int? pageSize = null,
            [FromQuery] int? limit = null) =>
            Run(async actor => Ok(EnrollmentApi.Paged("Approved enrollments retrieved successfully",
                await Service.GetApprovalsAsync(actor, "Approved", search, page, PageSize(pageSize, limit), Aborted))));

        // Batches the reviewer can assign: same course + organization as the stored enrollment.
        [HttpGet("{enrollmentId:int}/batches")]
        [HasPermission("Enrollment Approval", "view")]
        public Task<IActionResult> GetApprovalBatches(int enrollmentId) =>
            Run(async actor => Ok(EnrollmentApi.Success("Eligible batches retrieved successfully",
                await Service.GetApprovalBatchesAsync(actor, enrollmentId, Aborted))));

        [HttpGet("{enrollmentId:int}/history")]
        [HasPermission("Enrollment Approval", "view")]
        public Task<IActionResult> GetHistory(int enrollmentId) =>
            Run(async actor => Ok(EnrollmentApi.Success("Enrollment history retrieved successfully",
                await Service.GetHistoryAsync(actor, enrollmentId, Aborted))));

        [HttpPost("{enrollmentId:int}/approve")]
        [HttpPut("{enrollmentId:int}/approve")]
        [HasPermission("Enrollment Approval", "edit")]
        public Task<IActionResult> Approve(int enrollmentId, [FromBody] ApproveEnrollmentDto? dto) =>
            Run(async actor => Ok(EnrollmentApi.Success("Student enrollment approved successfully",
                await Service.ApproveAsync(actor, enrollmentId, dto ?? new ApproveEnrollmentDto(), Aborted))));

        [HttpPost("{enrollmentId:int}/reject")]
        [HttpPut("{enrollmentId:int}/reject")]
        [HasPermission("Enrollment Approval", "edit")]
        public Task<IActionResult> Reject(int enrollmentId, [FromBody] RejectWithReasonDto dto) =>
            Run(async actor => Ok(EnrollmentApi.Success("Student enrollment rejected successfully",
                await Service.RejectEnrollmentAsync(actor, enrollmentId, dto.EffectiveReason, Aborted))));

        // Adds the Invoice List rows for approved UPI enrollments that have none yet
        // (enrollments approved before invoices were created at approval). Safe to repeat.
        [HttpPost("invoices/sync")]
        [HasPermission("Enrollment Approval", "edit")]
        public Task<IActionResult> SyncInvoices() =>
            Run(async actor =>
            {
                var created = await Service.SyncApprovedInvoicesAsync(actor, Aborted);
                return Ok(EnrollmentApi.Success($"{created} invoice(s) created", new { created }));
            });

        [HttpPost("{enrollmentId:int}/resend-setup-link")]
        [HasPermission("Enrollment Approval", "edit")]
        public Task<IActionResult> ResendSetupLink(int enrollmentId) =>
            Run(async actor =>
            {
                var result = await Service.ResendSetupLinkAsync(actor, enrollmentId, Aborted);
                return Ok(EnrollmentApi.Success(result.Message, result));
            });
    }

    // =====================================================================
    // ORGANIZATION UPI SETTINGS — Organization / Organization Admin only
    // (same restriction as organization branding)
    // =====================================================================

    [ApiController]
    [Authorize(Roles = "OrganizationAdmin,Organization")]
    [Route("api/v1/organization/payment-settings")]
    public class OrganizationPaymentSettingsController : OrganizationEnrollmentControllerBase
    {
        public OrganizationPaymentSettingsController(
            IOrganizationEnrollmentService service,
            IOrganizationActorResolver actorResolver)
            : base(service, actorResolver) { }

        [HttpGet]
        public Task<IActionResult> Get() =>
            Run(async actor => Ok(EnrollmentApi.Success("Payment settings retrieved successfully",
                await Service.GetPaymentSettingsAsync(actor, Aborted))));

        // One POST and one PUT (Frontend 17 settings form): multipart/form-data with
        // UpiId, PayeeName, optional IsActive and optional QrCodeImage. Two actions
        // on the same method + path (JSON and form) broke Swagger generation.
        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(3 * 1024 * 1024)]
        [RequestFormLimits(MultipartBodyLengthLimit = 3 * 1024 * 1024)]
        public Task<IActionResult> Create([FromForm] OrganizationPaymentSettingsFormDto dto) =>
            Run(async actor =>
            {
                var settings = await Service.CreatePaymentSettingsAsync(actor, dto, Aborted);
                if (dto.QrCodeImage is { Length: > 0 })
                    settings = await Service.UploadQrAsync(actor, dto.QrCodeImage, Aborted);
                return StatusCode(StatusCodes.Status201Created,
                    EnrollmentApi.Success("Organization UPI settings created successfully", settings));
            });

        [HttpPut]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(3 * 1024 * 1024)]
        [RequestFormLimits(MultipartBodyLengthLimit = 3 * 1024 * 1024)]
        public Task<IActionResult> Update([FromForm] OrganizationPaymentSettingsFormDto dto) =>
            Run(async actor =>
            {
                var settings = await Service.UpdatePaymentSettingsAsync(actor, dto, Aborted);
                if (dto.QrCodeImage is { Length: > 0 })
                    settings = await Service.UploadQrAsync(actor, dto.QrCodeImage, Aborted);
                return Ok(EnrollmentApi.Success("Organization payment settings updated successfully", settings));
            });

        [HttpPost("qr")]
        [RequestSizeLimit(3 * 1024 * 1024)]
        [RequestFormLimits(MultipartBodyLengthLimit = 3 * 1024 * 1024)]
        [Consumes("multipart/form-data")]
        public Task<IActionResult> UploadQr(IFormFile file) =>
            Run(async actor => Ok(EnrollmentApi.Success("UPI QR code uploaded successfully",
                await Service.UploadQrAsync(actor, file, Aborted))));

        [HttpGet("qr")]
        public Task<IActionResult> GetQr() =>
            Run(async actor =>
            {
                var (stream, contentType) = await Service.OpenQrAsync(actor, Aborted);
                Response.Headers.CacheControl = "private, no-store";
                return File(stream, contentType);
            });
    }
}
