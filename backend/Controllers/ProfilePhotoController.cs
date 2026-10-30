using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs.Profile;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/v1/profile/photo")]
    [Authorize]
    public class ProfilePhotoController : ControllerBase
    {
        private readonly IProfilePhotoService _service;

        public ProfilePhotoController(
            IProfilePhotoService service)
        {
            _service = service;
        }

        // =====================================================
        // UPLOAD / REPLACE PROFILE PHOTO
        // =====================================================

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadPhoto(
            [FromForm] UploadProfilePhotoDto dto)
        {
            try
            {
                var result =
                    await _service.UploadPhotoAsync(dto);

                return Ok(new
                {
                    success = true,
                    message =
                        "Profile photo uploaded successfully.",
                    data = result
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // =====================================================
        // GET CURRENT PROFILE PHOTO
        // =====================================================

        [HttpGet]
        public async Task<IActionResult> GetPhoto()
        {
            var result =
                await _service.GetPhotoAsync();

            if (result == null)
            {
                return NotFound(new
                {
                    success = false,
                    message =
                        "Profile photo not found."
                });
            }

            return Ok(new
            {
                success = true,
                data = result
            });
        }

        // =====================================================
        // DELETE PROFILE PHOTO
        // =====================================================

        [HttpDelete]
        public async Task<IActionResult> DeletePhoto()
        {
            await _service.DeletePhotoAsync();

            return Ok(new
            {
                success = true,
                message =
                    "Profile photo deleted successfully."
            });
        }

        // =====================================================
        // GET PROFILE PHOTO BY TYPE + ID
        // =====================================================
        //
        // Student:
        // GET /api/v1/profile/photo/student/25
        //
        // Employee:
        // GET /api/v1/profile/photo/employee/10
        //
        // Mentor:
        // GET /api/v1/profile/photo/mentor/7
        //
        // =====================================================

        [HttpGet("{profileType}/{profileId:int}")]
        public async Task<IActionResult>
            GetPhotoByProfile(
                string profileType,
                int profileId)
        {
            try
            {
                var result =
                    await _service.GetPhotoByProfileAsync(
                        profileType,
                        profileId);

                if (result == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message =
                            "Profile not found."
                    });
                }

                return Ok(new
                {
                    success = true,
                    data = result
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
        // =====================================================
        // GET MULTIPLE PROFILE PHOTOS
        // =====================================================
        //
        // Example:
        //
        // GET /api/v1/profile/photo/batch
        //     ?studentIds=1,2,3
        //     &employeeIds=10,11
        //     &mentorIds=5,6
        //
        // =====================================================

        [HttpGet("batch")]
        public async Task<IActionResult>
            GetPhotos(
                [FromQuery] string? studentIds = null,
                [FromQuery] string? employeeIds = null,
                [FromQuery] string? mentorIds = null)
        {
            try
            {
                var students =
                    ParseIds(studentIds);

                var employees =
                    ParseIds(employeeIds);

                var mentors =
                    ParseIds(mentorIds);

                if (students.Count == 0 &&
                    employees.Count == 0 &&
                    mentors.Count == 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "At least one profile ID is required."
                    });
                }

                var result =
                    await _service.GetPhotosAsync(
                        students,
                        employees,
                        mentors);

                return Ok(new
                {
                    success = true,

                    count =
                        result.Count,

                    data =
                        result
                });
            }
            catch (Exception ex)
                when (ex is ArgumentException ||
                      ex is UnauthorizedAccessException)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }


        // =====================================================
        // PARSE COMMA-SEPARATED IDS
        // =====================================================

        private static List<int> ParseIds(
            string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return new List<int>();
            }

            return value
                .Split(
                    ',',
                    StringSplitOptions.RemoveEmptyEntries)
                .Select(x =>
                    int.TryParse(
                        x.Trim(),
                        out var id)
                        ? id
                        : 0)
                .Where(x => x > 0)
                .Distinct()
                .Take(100)
                .ToList();
        }
    }
}