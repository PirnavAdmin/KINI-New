using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/v1/reports")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportsService _service;

        public ReportsController(
            IReportsService service)
        {
            _service = service;
        }

        // =====================================================
        // HR ANALYTICS
        // Reports -> View
        // =====================================================

        [HttpGet("hr-analytics")]
        [HasPermission("Reports", "view")]
        public async Task<IActionResult> GetHrAnalytics()
        {
            var result =
                await _service.GetHrAnalyticsAsync();

            return Ok(result);
        }

        // =====================================================
        // SKILLS ANALYTICS
        // Reports -> View
        // =====================================================

        [HttpGet("skills-analytics")]
        [HasPermission("Reports", "view")]
        public async Task<IActionResult> GetSkillsAnalytics()
        {
            var result =
                await _service.GetSkillsAnalyticsAsync();

            return Ok(result);
        }

        // =====================================================
        // PERFORMANCE ANALYTICS
        // Reports -> View
        // =====================================================

        [HttpGet("performance-analytics")]
        [HasPermission("Reports", "view")]
        public async Task<IActionResult> GetPerformanceAnalytics()
        {
            var result =
                await _service.GetPerformanceAnalyticsAsync();

            return Ok(result);
        }

        // =====================================================
        // WORKFORCE ANALYTICS
        // Reports -> View
        // =====================================================

        [HttpGet("workforce-analytics")]
        [HasPermission("Reports", "view")]
        public async Task<IActionResult> GetWorkforceAnalytics()
        {
            var result =
                await _service.GetWorkforceAnalyticsAsync();

            return Ok(result);
        }
    }
}