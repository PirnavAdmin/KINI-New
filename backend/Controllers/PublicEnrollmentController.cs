using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TalentSphereAPI.DTOs.PublicEnrollment;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    /// <summary>
    /// Public (guest) enrollment + UPI payment proof.
    ///
    /// No JWT. Creating an enrollment is anonymous; everything about an
    /// existing enrollment requires its enrollment-specific access token in
    /// the X-Enrollment-Token header. Course listing stays on the existing
    /// GET /api/v1/courses/public endpoints.
    ///
    /// Responses use the standard envelope { success, message, data }.
    /// </summary>
    [ApiController]
    [AllowAnonymous]
    [EnrollmentApiValidation]
    [Route("api/v1/public/enrollments")]
    public class PublicEnrollmentController : ControllerBase
    {
        public const string TokenHeader = "X-Enrollment-Token";
        private const long MaxUploadRequestBytes = 6 * 1024 * 1024;

        private readonly IPublicEnrollmentService _service;

        public PublicEnrollmentController(IPublicEnrollmentService service)
        {
            _service = service;
        }

        private string? Token =>
            Request.Headers.TryGetValue(TokenHeader, out var value) ? value.ToString() : null;

        // POST /api/v1/public/enrollments
        [HttpPost]
        [EnableRateLimiting(RateLimitPolicies.PublicEnrollmentWrite)]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public Task<IActionResult> Create(
            [FromBody] CreatePublicEnrollmentDto dto,
            CancellationToken ct) =>
            Run(async () =>
            {
                var created = await _service.CreateAsync(dto, ct);
                return CreatedAtAction(nameof(GetDetails), new { enrollmentId = created.EnrollmentId },
                    EnrollmentApi.Success("Course enrollment created successfully", created));
            });

        // GET /api/v1/public/enrollments/{id}  — the applicant's own details
        [HttpGet("{enrollmentId:int}")]
        [EnableRateLimiting(RateLimitPolicies.PublicEnrollmentRead)]
        public Task<IActionResult> GetDetails(int enrollmentId, CancellationToken ct) =>
            Run(async () =>
            {
                Response.Headers.CacheControl = "no-store";
                return Ok(EnrollmentApi.Success("Enrollment details retrieved successfully",
                    await _service.GetDetailsAsync(enrollmentId, Token, ct)));
            });

        // GET /api/v1/public/enrollments/{id}/payment
        [HttpGet("{enrollmentId:int}/payment")]
        [EnableRateLimiting(RateLimitPolicies.PublicEnrollmentRead)]
        public Task<IActionResult> GetPaymentDetails(int enrollmentId, CancellationToken ct) =>
            Run(async () => Ok(EnrollmentApi.Success("Payment details retrieved successfully",
                await _service.GetPaymentDetailsAsync(enrollmentId, Token, ct))));

        // GET /api/v1/public/enrollments/{id}/payment/qr
        [HttpGet("{enrollmentId:int}/payment/qr")]
        [EnableRateLimiting(RateLimitPolicies.PublicEnrollmentRead)]
        public Task<IActionResult> GetQrImage(int enrollmentId, CancellationToken ct) =>
            Run(async () =>
            {
                var (stream, contentType) = await _service.OpenQrImageAsync(enrollmentId, Token, ct);
                Response.Headers.CacheControl = "no-store";
                return File(stream, contentType);
            });

        // POST /api/v1/public/enrollments/{id}/payments  (multipart/form-data)
        [HttpPost("{enrollmentId:int}/payments")]
        [EnableRateLimiting(RateLimitPolicies.PublicEnrollmentWrite)]
        [RequestSizeLimit(MaxUploadRequestBytes)]
        [RequestFormLimits(MultipartBodyLengthLimit = MaxUploadRequestBytes)]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public Task<IActionResult> SubmitPayment(
            int enrollmentId,
            [FromForm] SubmitPaymentProofDto dto,
            CancellationToken ct) =>
            Run(async () => StatusCode(StatusCodes.Status201Created, EnrollmentApi.Success(
                "Payment submitted successfully. Waiting for organization verification.",
                await _service.SubmitPaymentAsync(enrollmentId, Token, dto, ct))));

        // GET /api/v1/public/enrollments/{id}/payments  — payment attempt history
        [HttpGet("{enrollmentId:int}/payments")]
        [EnableRateLimiting(RateLimitPolicies.PublicEnrollmentRead)]
        public Task<IActionResult> GetPaymentHistory(int enrollmentId, CancellationToken ct) =>
            Run(async () =>
            {
                Response.Headers.CacheControl = "no-store";
                return Ok(EnrollmentApi.Success("Payment history retrieved successfully",
                    await _service.GetPaymentHistoryAsync(enrollmentId, Token, ct)));
            });

        // GET /api/v1/public/enrollments/{id}/status
        [HttpGet("{enrollmentId:int}/status")]
        [EnableRateLimiting(RateLimitPolicies.PublicEnrollmentRead)]
        public Task<IActionResult> GetStatus(int enrollmentId, CancellationToken ct) =>
            Run(async () =>
            {
                Response.Headers.CacheControl = "no-store";
                return Ok(EnrollmentApi.Success("Enrollment status retrieved successfully",
                    await _service.GetStatusAsync(enrollmentId, Token, ct)));
            });

        // POST /api/v1/public/enrollments/access-link
        // Always 202 so it cannot be used to discover enrollments.
        [HttpPost("access-link")]
        [EnableRateLimiting(RateLimitPolicies.PublicEnrollmentWrite)]
        public Task<IActionResult> RequestAccessLink(
            [FromBody] RequestEnrollmentAccessLinkDto dto,
            CancellationToken ct) =>
            Run(async () =>
            {
                await _service.RequestAccessLinkAsync(dto, ct);
                return Accepted(EnrollmentApi.Success(
                    "If the details match an enrollment, a new link has been sent to that email.", null));
            });

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
}
