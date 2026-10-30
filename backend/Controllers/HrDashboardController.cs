using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/hr/dashboard")]
    [Authorize]
    [HasPermission("Dashboard", "view")]
    public class HrDashboardController : ControllerBase
    {
        private readonly IDashboardService _service;

        public HrDashboardController(
            IDashboardService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            var result =
                await _service.GetHrDashboardAsync();

            return Ok(result);
        }
    }
}