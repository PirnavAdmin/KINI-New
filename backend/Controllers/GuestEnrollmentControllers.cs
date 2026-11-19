using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TalentSphereAPI.DTOs.PublicEnrollment;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    /// <summary>
    /// Guest checkout used by Frontend 17 (see frontend/GUEST_ENROLLMENT_BACKEND_REQUIREMENTS.md).
    /// No login: creation is anonymous; every other action needs the
    /// enrollment's own capability in X-Enrollment-Token (hashed, expiring,
    /// constant-time compared). An enrollment id alone never grants access.
    /// Same service and tables as /api/v1/public/enrollments; only the shapes differ.
    /// </summary>
    [ApiController]
    [AllowAnonymous]
    [EnrollmentApiValidation]
    [Route("api/v1/guest/enrollments")]
    public class GuestEnrollmentController : ControllerBase
    {
        private const string IdempotencyHeader = "Idempotency-Key";
        private const long MaxUploadRequestBytes = 6 * 1024 * 1024;

        private readonly IPublicEnrollmentService _service;

        public GuestEnrollmentController(IPublicEnrollmentService service)
        {
            _service = service;
        }

        private string? Token =>
            Request.Headers.TryGetValue(PublicEnrollmentController.TokenHeader, out var value) ? value.ToString() : null;

        private string? IdempotencyKey =>
            Request.Headers.TryGetValue(IdempotencyHeader, out var value) ? value.ToString() : null;

        // POST /api/v1/guest/enrollments
        [HttpPost]
        [EnableRateLimiting(RateLimitPolicies.PublicEnrollmentWrite)]
        public Task<IActionResult> Create([FromBody] GuestCreateEnrollmentDto dto, CancellationToken ct) =>
            Run(async () =>
            {
                var created = await _service.CreateGuestAsync(dto, IdempotencyKey, ct);
                Response.Headers.CacheControl = "no-store";
                return StatusCode(StatusCodes.Status201Created,
                    EnrollmentApi.Success("Enrollment created. Continue to payment.", created));
            });

        // GET /api/v1/guest/enrollments/{id}  — status tracking
        [HttpGet("{enrollmentId:int}")]
        [EnableRateLimiting(RateLimitPolicies.PublicEnrollmentRead)]
        public Task<IActionResult> GetStatus(int enrollmentId, CancellationToken ct) =>
            Run(async () =>
            {
                Response.Headers.CacheControl = "no-store";
                return Ok(EnrollmentApi.Success("Enrollment status retrieved successfully",
                    await _service.GetGuestStatusAsync(enrollmentId, Token, ct)));
            });

        // GET /api/v1/guest/enrollments/{id}/payment  — UPI details + QR
        [HttpGet("{enrollmentId:int}/payment")]
        [EnableRateLimiting(RateLimitPolicies.PublicEnrollmentRead)]
        public Task<IActionResult> GetPaymentInfo(int enrollmentId, CancellationToken ct) =>
            Run(async () =>
            {
                Response.Headers.CacheControl = "no-store";
                return Ok(EnrollmentApi.Success("Payment details retrieved successfully",
                    await _service.GetGuestPaymentInfoAsync(enrollmentId, Token, ct)));
            });

        // POST /api/v1/guest/enrollments/{id}/payments  (multipart: UTRNumber, PaymentScreenshot)
        [HttpPost("{enrollmentId:int}/payments")]
        [EnableRateLimiting(RateLimitPolicies.PublicEnrollmentWrite)]
        [RequestSizeLimit(MaxUploadRequestBytes)]
        [RequestFormLimits(MultipartBodyLengthLimit = MaxUploadRequestBytes)]
        [Consumes("multipart/form-data")]
        public Task<IActionResult> SubmitPayment(int enrollmentId, [FromForm] SubmitPaymentProofDto dto, CancellationToken ct) =>
            Run(async () => StatusCode(StatusCodes.Status201Created, EnrollmentApi.Success(
                "Payment submitted successfully. Waiting for organization verification.",
                await _service.SubmitPaymentAsync(enrollmentId, Token, dto, IdempotencyKey, ct))));

        private static async Task<IActionResult> Run(Func<Task<IActionResult>> action)
        {
            try
            {
                return await action();
            }
            catch (Exception ex) when (ex is EnrollmentValidationException or EnrollmentWorkflowException)
            {
                return EnrollmentApi.FromException(ex);
            }
        }
    }

    /// <summary>
    /// Guest account activation used by Frontend 17 (/activate-account?token=...).
    /// Same single-use, expiring, hashed setup tokens as /api/v1/public/password-setup.
    /// </summary>
    [ApiController]
    [AllowAnonymous]
    [EnrollmentApiValidation]
    [Route("api/v1/guest/account-activation")]
    public class GuestAccountActivationController : ControllerBase
    {
        private readonly IPasswordSetupService _service;

        public GuestAccountActivationController(IPasswordSetupService service)
        {
            _service = service;
        }

        // POST /api/v1/guest/account-activation/inspect  { token }
        // → { status: "valid" | "used" | "expired", email (masked), firstName }
        [HttpPost("inspect")]
        [EnableRateLimiting(RateLimitPolicies.PublicEnrollmentRead)]
        public async Task<IActionResult> Inspect([FromBody] PasswordSetupTokenDto dto, CancellationToken ct)
        {
            Response.Headers.CacheControl = "no-store";
            try
            {
                var info = await _service.InspectAsync(dto.Token, ct);
                return Ok(EnrollmentApi.Success("Activation link is valid", new GuestActivationInfoDto
                {
                    Status = "valid",
                    Email = info.MaskedEmail,
                    FirstName = info.FirstName
                }));
            }
            catch (EnrollmentWorkflowException ex) when (ex.Code is "SETUP_LINK_USED" or "SETUP_LINK_EXPIRED")
            {
                var status = ex.Code == "SETUP_LINK_USED" ? "used" : "expired";
                return Ok(EnrollmentApi.Success(ex.Message, new GuestActivationInfoDto { Status = status }));
            }
            catch (Exception ex) when (ex is EnrollmentValidationException or EnrollmentWorkflowException)
            {
                return EnrollmentApi.FromException(ex);
            }
        }

        // POST /api/v1/guest/account-activation  { token, password }
        [HttpPost]
        [EnableRateLimiting(RateLimitPolicies.PublicEnrollmentWrite)]
        public async Task<IActionResult> Activate([FromBody] GuestAccountActivationDto dto, CancellationToken ct)
        {
            Response.Headers.CacheControl = "no-store";
            try
            {
                await _service.CompleteAsync(new CompletePasswordSetupDto
                {
                    Token = dto.Token,
                    Password = dto.Password,
                    ConfirmPassword = dto.Password
                }, ct);
                return Ok(EnrollmentApi.Success(
                    "Your account is active. Sign in with your email and new password.",
                    new { loginPath = "/login" }));
            }
            catch (Exception ex) when (ex is EnrollmentValidationException or EnrollmentWorkflowException)
            {
                return EnrollmentApi.FromException(ex);
            }
        }
    }
}
