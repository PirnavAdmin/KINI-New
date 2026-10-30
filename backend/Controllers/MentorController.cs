using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs.Mentor;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers.v1
{
    [ApiController]
    [Route("api/v1/organization/mentors")]
    
    public class MentorController : ControllerBase
    {
        private readonly IMentorService _mentorService;

        public MentorController(
            IMentorService mentorService)
        {
            _mentorService = mentorService;
        }

        // =====================================================
        // GET ALL MENTORS
        // =====================================================

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] MentorQueryParameters query)
        {
            var result =
                await _mentorService
                    .GetAllAsync(query);

            return Ok(new
            {
                TotalCount =
                    result.TotalCount,

                Data =
                    result.Mentors
            });
        }

        // =====================================================
        // GET MENTOR BY ID
        // =====================================================

        [HttpGet("{mentorId:int}")]
        public async Task<IActionResult> GetById(
            int mentorId)
        {
            var mentor =
                await _mentorService
                    .GetByIdAsync(mentorId);

            if (mentor == null)
            {
                return NotFound(new
                {
                    Message =
                        "Mentor not found."
                });
            }

            return Ok(mentor);
        }

        // =====================================================
        // CREATE MENTOR
        // =====================================================

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateMentorDto dto)
        {
            try
            {
                var result =
                    await _mentorService
                        .CreateAsync(dto);

                if (!result)
                {
                    return BadRequest(new
                    {
                        Message =
                            "Unable to create mentor."
                    });
                }

                return Ok(new
                {
                    Message =
                        "Mentor created successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }

        // =====================================================
        // UPDATE MENTOR
        // =====================================================

        [HttpPut("{mentorId:int}")]
        public async Task<IActionResult> Update(
            int mentorId,
            [FromBody] UpdateMentorDto dto)
        {
            try
            {
                var result =
                    await _mentorService
                        .UpdateAsync(
                            mentorId,
                            dto);

                if (!result)
                {
                    return NotFound(new
                    {
                        Message =
                            "Mentor not found."
                    });
                }

                return Ok(new
                {
                    Message =
                        "Mentor updated successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }

        // =====================================================
        // DELETE MENTOR
        // =====================================================

        [HttpDelete("{mentorId:int}")]
        public async Task<IActionResult> Delete(
            int mentorId)
        {
            var result =
                await _mentorService
                    .DeleteAsync(mentorId);

            if (!result)
            {
                return NotFound(new
                {
                    Message =
                        "Mentor not found."
                });
            }

            return Ok(new
            {
                Message =
                    "Mentor deleted successfully."
            });
        }
    }
}