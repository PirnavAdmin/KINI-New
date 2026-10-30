using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers;

[ApiController]
[Route("api/students")]
[Authorize]
public class HrStudentController : ControllerBase
{
    private readonly IHrStudentService _studentService;

    public HrStudentController(IHrStudentService studentService)
    {
        _studentService = studentService;
    }

    // =========================================================
    // GET /api/students/summary
    // =========================================================

    [HttpGet("summary")]
    [HasPermission("Students", "view")]
    public async Task<IActionResult> GetSummary()
    {
        var result = await _studentService.GetSummaryAsync();

        return Ok(result);
    }

    // =========================================================
    // GET /api/students
    // =========================================================

    [HttpGet]
    [HasPermission("Students", "view")]
    public async Task<IActionResult> GetAll(
        [FromQuery] HrStudentQueryDto query)
    {
        var (items, totalCount) =
            await _studentService.GetAllAsync(query);

        return Ok(new
        {
            items,
            totalCount,
            pageNumber = query.PageNumber < 1
                ? 1
                : query.PageNumber,
            pageSize = query.PageSize < 1
                ? 10
                : Math.Min(query.PageSize, 100)
        });
    }

    // =========================================================
    // GET /api/students/{studentId}
    // =========================================================

    [HttpGet("{studentId:int}")]
    [HasPermission("Students", "view")]
    public async Task<IActionResult> GetById(int studentId)
    {
        var result =
            await _studentService.GetByIdAsync(studentId);

        if (result == null)
        {
            return NotFound(new
            {
                message = "Student not found."
            });
        }

        return Ok(result);
    }

    // =========================================================
    // PUT /api/students/{studentId}
    // =========================================================

    [HttpPut("{studentId:int}")]
    [HasPermission("Students", "edit")]
    public async Task<IActionResult> Update(
        int studentId,
        [FromBody] HrStudentUpdateDto dto)
    {
        if (dto == null)
        {
            return BadRequest(new
            {
                message = "Request body is required."
            });
        }

        try
        {
            var updated =
                await _studentService.UpdateAsync(
                    studentId,
                    dto);

            if (!updated)
            {
                return NotFound(new
                {
                    message = "Student not found."
                });
            }

            var student =
                await _studentService.GetByIdAsync(studentId);

            return Ok(student);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new
                {
                    message = ex.Message
                });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // DELETE /api/students/{studentId}
    // =========================================================

    [HttpDelete("{studentId:int}")]
    [HasPermission("Students", "delete")]
    public async Task<IActionResult> Delete(int studentId)
    {
        try
        {
            var deleted =
                await _studentService.DeleteAsync(studentId);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Student not found."
                });
            }

            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new
                {
                    message = ex.Message
                });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // PATCH /api/students/{studentId}/status
    // =========================================================

    [HttpPatch("{studentId:int}/status")]
    [HasPermission("Students", "edit")]
    public async Task<IActionResult> UpdateStatus(
        int studentId,
        [FromBody] HrStudentStatusUpdateDto dto)
    {
        if (dto == null)
        {
            return BadRequest(new
            {
                message = "Request body is required."
            });
        }

        try
        {
            var updated =
                await _studentService.UpdateStatusAsync(
                    studentId,
                    dto);

            if (!updated)
            {
                return NotFound(new
                {
                    message = "Student not found."
                });
            }

            var student =
                await _studentService.GetByIdAsync(studentId);

            return Ok(student);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // GET /api/students/{studentId}/enrollments
    // =========================================================

    [HttpGet("{studentId:int}/enrollments")]
    [HasPermission("Students", "view")]
    public async Task<IActionResult> GetEnrollment(
        int studentId)
    {
        var result =
            await _studentService.GetEnrollmentAsync(studentId);

        if (result == null)
        {
            return NotFound(new
            {
                message = "Student enrollment not found."
            });
        }

        return Ok(result);
    }
}