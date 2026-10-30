using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Providers;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/v1/zoom-test")]
    public class ZoomTestController : ControllerBase
    {
        private readonly IMeetingProviderFactory
            _meetingProviderFactory;

        public ZoomTestController(
            IMeetingProviderFactory meetingProviderFactory)
        {
            _meetingProviderFactory =
                meetingProviderFactory;
        }

        [HttpGet("connection")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                var provider =
                    _meetingProviderFactory
                        .GetProvider("Zoom");

                if (provider == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Zoom provider is not registered."
                    });
                }

                var result =
                    await provider.TestConnectionAsync();

                return Ok(new
                {
                    success = result,
                    message = result
                        ? "Zoom OAuth connection successful."
                        : "Zoom OAuth connection failed."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Zoom OAuth connection failed.",
                    error = ex.Message
                });
            }
        }
    }
}