
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.Student;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [Route("api/v1/organization/students")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly IStudentService _studentService;

        public StudentController(
            IStudentService studentService)
        {
            _studentService = studentService;
        }

        // ==================================================
        // GET ALL STUDENTS
        // Permission: Students -> View
        // ==================================================

        [HttpGet]
        [HasPermission("Students", "view")]
        public async Task<IActionResult> GetAllStudents(
            [FromQuery] StudentQueryDto query)
        {
            var students =
                await _studentService
                    .GetAllAsync(query);

            return Ok(students);
        }

        // ==================================================
        // GET STUDENT BY ID
        // Permission: Students -> View
        // ==================================================

        [HttpGet("{id}")]
        [HasPermission("Students", "view")]
        public async Task<IActionResult> GetStudentById(
            int id)
        {
            var student =
                await _studentService
                    .GetByIdAsync(id);

            if (student == null)
            {
                return NotFound(
                    "Student not found.");
            }

            return Ok(student);
        }

        // ==================================================
        // CREATE STUDENT
        // Permission: Students -> Add
        // ==================================================

        [HttpPost]
        [HasPermission("Students", "add")]
        public async Task<IActionResult> CreateStudent(
            [FromBody] CreateStudentDto dto)
        {
            try
            {
                var student =
                    await _studentService
                        .CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetStudentById),
                    new
                    {
                        id = student.StudentId
                    },
                    student);
            }
            catch (Exception ex)
            {
                return BadRequest(
                    new
                    {
                        message = ex.Message
                    });
            }
        }

        // ==================================================
        // UPDATE STUDENT
        // Permission: Students -> Edit
        // ==================================================

        [HttpPut("{id}")]
        [HasPermission("Students", "edit")]
        public async Task<IActionResult> UpdateStudent(
            int id,
            [FromBody] UpdateStudentDto dto)
        {
            try
            {
                var updated =
                    await _studentService
                        .UpdateAsync(id, dto);

                if (!updated)
                {
                    return NotFound(
                        "Student not found.");
                }

                return Ok(
                    "Student updated successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(
                    new
                    {
                        message = ex.Message
                    });
            }
        }

        // ==================================================
        // APPROVE STUDENT
        // ==================================================

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveStudent(int id)
        {
            try
            {
                var approved =
                    await _studentService
                        .ApproveAsync(id);

                if (!approved)
                {
                    return NotFound(
                        "Student enrollment not found.");
                }

                return Ok(new
                {
                    success = true,
                    message =
                        "Student enrollment approved successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }


        // ==================================================
        // REJECT STUDENT
        // ==================================================

        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectStudent(int id)
        {
            try
            {
                var rejected =
                    await _studentService
                        .RejectAsync(id);

                if (!rejected)
                {
                    return NotFound(
                        "Student enrollment not found.");
                }

                return Ok(new
                {
                    success = true,
                    message =
                        "Student enrollment rejected successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // ==================================================
        // DELETE STUDENT
        // Permission: Students -> Delete
        // ==================================================

        [HttpDelete("{id}")]
        [HasPermission("Students", "delete")]
        public async Task<IActionResult> DeleteStudent(
            int id)
        {
            try
            {
                var deleted =
                    await _studentService
                        .DeleteAsync(id);

                if (!deleted)
                {
                    return NotFound(
                        "Student not found.");
                }

                return Ok(
                    "Student deleted successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(
                    new
                    {
                        message = ex.Message
                    });
            }
        }
    }
}
