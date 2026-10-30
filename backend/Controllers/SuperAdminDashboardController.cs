using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/superadmin/dashboard")]
    public class SuperAdminDashboardController
        : ControllerBase
    {
        private readonly ISuperAdminDashboardService _service;

        public SuperAdminDashboardController(
            ISuperAdminDashboardService service)
        {
            _service = service;
        }

        [HttpGet("organizations/summary")]
        public async Task<IActionResult>
            GetOrganizationSummary()
        {
            var result =
                await _service
                    .GetOrganizationSummaryAsync();

            return Ok(result);
        }

        [HttpGet("organizations")]
        public async Task<IActionResult>
            GetOrganizations()
        {
            var result =
                await _service
                    .GetOrganizationsAsync();

            return Ok(result);
        }

        [HttpGet("organizations/{organizationId:int}")]
        public async Task<IActionResult>
            GetOrganizationDetails(
                int organizationId)
        {
            var result =
                await _service
                    .GetOrganizationDetailsAsync(
                        organizationId);

            if (result == null)
            {
                return NotFound(new
                {
                    message =
                        "Organization not found."
                });
            }

            return Ok(result);
        }

        [HttpGet(
            "/api/superadmin/organizations/{organizationId:int}/subscription")]
        public async Task<IActionResult>
            GetOrganizationSubscription(
                int organizationId)
        {
            var result =
                await _service
                    .GetOrganizationSubscriptionAsync(
                        organizationId);

            if (result == null)
            {
                return NotFound(new
                {
                    message =
                        "Active subscription not found."
                });
            }

            return Ok(result);
        }
    }
}