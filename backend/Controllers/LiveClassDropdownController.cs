using Microsoft.AspNetCore.Authorization;

using Microsoft.AspNetCore.Mvc;

using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers

{

    [ApiController]

    [Route("api/v1")]

   

    public class LiveClassDropdownController : ControllerBase

    {

        private readonly ILiveClassDropdownService _service;

        public LiveClassDropdownController(

            ILiveClassDropdownService service)

        {

            _service = service;

        }

        /// <summary>

        /// Get Courses Dropdown

        /// </summary>

        [HttpGet("courses/dropdown")]

        public async Task<IActionResult> GetCourses()

        {

            var result = await _service.GetCoursesAsync();

            return Ok(new

            {

                success = true,

                data = result

            });

        }

        /// <summary>

        /// Get Batches Dropdown

        /// </summary>

        [HttpGet("batches/dropdown")]

        public async Task<IActionResult> GetBatches()

        {

            var result = await _service.GetBatchesAsync();

            return Ok(new

            {

                success = true,

                data = result

            });

        }

        /// <summary>

        /// Get Mentors Dropdown

        /// </summary>

        [HttpGet("mentors/dropdown")]

        public async Task<IActionResult> GetMentors()

        {

            var result = await _service.GetMentorsAsync();

            return Ok(new

            {

                success = true,

                data = result

            });

        }

        /// <summary>

        /// Get Meeting Platforms Dropdown

        /// </summary>

        [HttpGet("meeting-platforms/dropdown")]

        public async Task<IActionResult> GetMeetingPlatforms()

        {

            var result = await _service.GetMeetingPlatformsAsync();

            return Ok(new

            {

                success = true,

                data = result

            });

        }

        /// <summary>

        /// Get Live Class Status Dropdown

        /// </summary>

        [HttpGet("status/dropdown")]

        public async Task<IActionResult> GetStatuses()

        {

            var result = await _service.GetStatusesAsync();

            return Ok(new

            {

                success = true,

                data = result

            });

        }

    }

}
