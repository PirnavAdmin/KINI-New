using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    /// <summary>
    /// Organization Fees &amp; Payments overview: summary cards and the latest
    /// completed payments, calculated from the organization's real payment
    /// records. The organization is resolved from the signed-in user.
    /// Payment history uses GET /api/v1/organization/payments?status=all&amp;sort=newest.
    /// </summary>
    [ApiController]
    [Authorize]
    [Route("api/v1/organization/finance")]
    public class FinanceOverviewController : ControllerBase
    {
        private readonly IFinanceOverviewService _finance;
        private readonly IOrganizationActorResolver _actorResolver;

        public FinanceOverviewController(IFinanceOverviewService finance, IOrganizationActorResolver actorResolver)
        {
            _finance = finance;
            _actorResolver = actorResolver;
        }

        // GET /api/v1/organization/finance/summary
        [HttpGet("summary")]
        [HasPermission("Payment Verification", "view")]
        [ProducesResponseType(typeof(FinanceSummaryDto), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetSummary()
        {
            try
            {
                var actor = await _actorResolver.ResolveAsync(User, HttpContext.RequestAborted);
                var summary = await _finance.GetSummaryAsync(actor.OrganizationId, HttpContext.RequestAborted);
                return Ok(EnrollmentApi.Success("Finance summary retrieved successfully", summary));
            }
            catch (Exception ex) when (ex is EnrollmentValidationException or EnrollmentWorkflowException)
            {
                return EnrollmentApi.FromException(ex);
            }
        }
    }
}
