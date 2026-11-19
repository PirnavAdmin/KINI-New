using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TalentSphereAPI.DTOs.PublicEnrollment;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    /// <summary>
    /// Public password setup for student accounts created by enrollment
    /// approval. The token is sent in the request body (POST), never in the
    /// URL, so it does not appear in server or proxy logs.
    /// </summary>
    [ApiController]
    [AllowAnonymous]
    [EnrollmentApiValidation]
    [Route("api/v1/public/password-setup")]
    public class PasswordSetupController : ControllerBase
    {
        private readonly IPasswordSetupService _service;

        public PasswordSetupController(IPasswordSetupService service)
        {
            _service = service;
        }

        [HttpPost("inspect")]
        [EnableRateLimiting(RateLimitPolicies.PublicEnrollmentRead)]
        public Task<IActionResult> Inspect([FromBody] PasswordSetupTokenDto dto, CancellationToken ct) =>
            Run(async () => Ok(EnrollmentApi.Success("Setup link is valid",
                await _service.InspectAsync(dto.Token, ct))));

        [HttpPost("complete")]
        [EnableRateLimiting(RateLimitPolicies.PublicEnrollmentWrite)]
        public Task<IActionResult> Complete([FromBody] CompletePasswordSetupDto dto, CancellationToken ct) =>
            Run(async () =>
            {
                await _service.CompleteAsync(dto, ct);
                return Ok(EnrollmentApi.Success(
                    "Your password has been set. Sign in with your email and new password.",
                    new { loginPath = "/login" }));
            });

        private async Task<IActionResult> Run(Func<Task<IActionResult>> action)
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
