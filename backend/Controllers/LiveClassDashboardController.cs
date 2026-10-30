using Microsoft.AspNetCore.Authorization;

using Microsoft.AspNetCore.Mvc;

using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers

{

    [ApiController]
    [Authorize]
    [Route("api/v1/live-classes")]

   

    public class LiveClassDashboardController : ControllerBase

    {

        private readonly ILiveClassDashboardService _service;

        public LiveClassDashboardController(

            ILiveClassDashboardService service)

        {

            _service = service;

        }

        /// <summary>

        /// Dashboard Statistics

        /// </summary>

        [HttpGet("dashboard")]

        public async Task<IActionResult> Dashboard()

        {

            var result =

                await _service.GetDashboardAsync();

            return Ok(new

            {

                success = true,

                data = result

            });

        }

        /// <summary>

        /// Upcoming Live Classes

        /// </summary>

        [HttpGet("upcoming")]

        public async Task<IActionResult> Upcoming()

        {

            var result =

                await _service.GetUpcomingAsync();

            return Ok(new

            {

                success = true,

                data = result

            });

        }

        /// <summary>

        /// Completed Live Classes

        /// </summary>

        [HttpGet("completed")]

        public async Task<IActionResult> Completed()

        {

            var result =

                await _service.GetCompletedAsync();

            return Ok(new

            {

                success = true,

                data = result

            });

        }

        /// <summary>

        /// Currently Live Classes

        /// </summary>

        [HttpGet("live")]

        public async Task<IActionResult> Live()

        {

            var result =

                await _service.GetLiveAsync();

            return Ok(new

            {

                success = true,

                data = result

            });

        }

    }

}
