using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecycleBinController : ControllerBase
    {
        private readonly IRecycleBinService _recycleBinService;

        public RecycleBinController(IRecycleBinService recycleBinService)
        {
            _recycleBinService = recycleBinService;
        }

        // ==========================
        // USERS
        // ==========================

        [HttpGet("users")]
        public async Task<IActionResult> GetDeletedUsers()
        {
            var result = await _recycleBinService.GetDeletedUsersAsync();
            return Ok(result);
        }

        [HttpPut("users/{id}/restore")]
        public async Task<IActionResult> RestoreUser(int id)
        {
            var result = await _recycleBinService.RestoreUserAsync(id);

            if (!result)
                return NotFound("Deleted user not found.");

            return Ok("User restored successfully.");
        }

        [HttpDelete("users/{id}/permanent")]
        public async Task<IActionResult> PermanentlyDeleteUser(int id)
        {
            var result = await _recycleBinService.PermanentlyDeleteUserAsync(id);

            if (!result)
                return NotFound("Deleted user not found.");

            return Ok("User permanently deleted.");
        }
        [HttpGet("students")]
        public async Task<IActionResult> GetDeletedStudents()
        {
            var result = await _recycleBinService.GetDeletedStudentsAsync();
            return Ok(result);
        }

        [HttpPut("students/{id}/restore")]
        public async Task<IActionResult> RestoreStudent(int id)
        {
            var result = await _recycleBinService.RestoreStudentAsync(id);

            if (!result)
                return NotFound("Deleted student not found.");

            return Ok("Student restored successfully.");
        }

        [HttpDelete("students/{id}/permanent")]
        public async Task<IActionResult> PermanentlyDeleteStudent(int id)
        {
            var result = await _recycleBinService.PermanentlyDeleteStudentAsync(id);

            if (!result)
                return NotFound("Deleted student not found.");

            return Ok("Student permanently deleted.");
        }
        [HttpGet("mentors")]
        public async Task<IActionResult> GetDeletedMentors()
        {
            var result = await _recycleBinService.GetDeletedMentorsAsync();
            return Ok(result);
        }

        [HttpPut("mentors/{id}/restore")]
        public async Task<IActionResult> RestoreMentor(int id)
        {
            var result = await _recycleBinService.RestoreMentorAsync(id);

            if (!result)
                return NotFound("Deleted mentor not found.");

            return Ok("Mentor restored successfully.");
        }

        [HttpDelete("mentors/{id}/permanent")]
        public async Task<IActionResult> PermanentlyDeleteMentor(int id)
        {
            var result = await _recycleBinService.PermanentlyDeleteMentorAsync(id);

            if (!result)
                return NotFound("Deleted mentor not found.");

            return Ok("Mentor permanently deleted.");
        }
        [HttpGet("employees")]
        public async Task<IActionResult> GetDeletedEmployees()
        {
            var result = await _recycleBinService.GetDeletedEmployeesAsync();
            return Ok(result);
        }

        [HttpPut("employees/{id}/restore")]
        public async Task<IActionResult> RestoreEmployee(int id)
        {
            var result = await _recycleBinService.RestoreEmployeeAsync(id);

            if (!result)
                return NotFound("Deleted employee not found.");

            return Ok("Employee restored successfully.");
        }

        [HttpDelete("employees/{id}/permanent")]
        public async Task<IActionResult> PermanentlyDeleteEmployee(int id)
        {
            var result = await _recycleBinService.PermanentlyDeleteEmployeeAsync(id);

            if (!result)
                return NotFound("Deleted employee not found.");

            return Ok("Employee permanently deleted.");
        }
    }

}