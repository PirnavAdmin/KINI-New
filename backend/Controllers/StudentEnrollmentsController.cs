using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    /// <summary>
    /// Logged-in student views of their enrollments and payment attempts.
    /// Before an account exists, applicants use the token-protected
    /// /api/v1/public/enrollments/{id}/status and /payments endpoints instead.
    /// Course content stays on the existing GET /api/v1/student/courses.
    /// </summary>
    [ApiController]
    [Authorize(Roles = "Student")]
    [EnrollmentApiValidation]
    [Route("api/v1/student")]
    public class StudentEnrollmentsController : ControllerBase
    {
        private readonly IStudentEnrollmentQueryService _service;

        public StudentEnrollmentsController(IStudentEnrollmentQueryService service)
        {
            _service = service;
        }

        // GET /api/v1/student/enrollments?page=1&limit=10&status=PendingPayment
        [HttpGet("enrollments")]
        public Task<IActionResult> GetEnrollments(
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int? limit = null,
            [FromQuery] int? pageSize = null) =>
            Run(async userId => Ok(EnrollmentApi.Paged("Student enrollments retrieved successfully",
                await _service.GetEnrollmentsAsync(userId, status, approvedOnly: false, page, limit ?? pageSize ?? 10, HttpContext.RequestAborted))));

        // GET /api/v1/student/enrollments/approved
        [HttpGet("enrollments/approved")]
        public Task<IActionResult> GetApproved(
            [FromQuery] int page = 1,
            [FromQuery] int? limit = null,
            [FromQuery] int? pageSize = null) =>
            Run(async userId => Ok(EnrollmentApi.Paged("Approved enrollments retrieved successfully",
                await _service.GetEnrollmentsAsync(userId, null, approvedOnly: true, page, limit ?? pageSize ?? 50, HttpContext.RequestAborted))));

        // GET /api/v1/student/enrollments/{id}/payment-history
        [HttpGet("enrollments/{enrollmentId:int}/payment-history")]
        public Task<IActionResult> GetPaymentHistory(int enrollmentId) =>
            Run(async userId => Ok(EnrollmentApi.Success("Payment history retrieved successfully",
                await _service.GetPaymentHistoryAsync(userId, enrollmentId, HttpContext.RequestAborted))));

        // GET /api/v1/student/payments  — the signed-in student's own UPI payments
        [HttpGet("payments")]
        public Task<IActionResult> GetPayments() =>
            Run(async userId => Ok(EnrollmentApi.Success("Payments retrieved successfully",
                await _service.GetPaymentsAsync(userId, HttpContext.RequestAborted))));

        // GET /api/v1/student/payments/{paymentId}/invoice  — PDF, own verified payments only
        [HttpGet("payments/{paymentId:int}/invoice")]
        public Task<IActionResult> GetPaymentInvoice(int paymentId) =>
            Run(async userId =>
            {
                var (pdf, fileName) = await _service.GetPaymentInvoicePdfAsync(userId, paymentId, HttpContext.RequestAborted);
                Response.Headers.CacheControl = "private, no-store";
                return File(pdf, "application/pdf", fileName);
            });

        // GET /api/v1/student/payments/{paymentId}
        [HttpGet("payments/{paymentId:int}")]
        public Task<IActionResult> GetPayment(int paymentId) =>
            Run(async userId => Ok(EnrollmentApi.Success("Payment details retrieved successfully",
                await _service.GetPaymentAsync(userId, paymentId, HttpContext.RequestAborted))));

        private async Task<IActionResult> Run(Func<int, Task<IActionResult>> action)
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized(EnrollmentApi.Error("Authentication required", "UNAUTHORIZED"));

            try
            {
                return await action(userId);
            }
            catch (Exception ex) when (ex is EnrollmentValidationException or EnrollmentWorkflowException)
            {
                return EnrollmentApi.FromException(ex);
            }
        }
    }
}
