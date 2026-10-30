using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.LiveClass;
using TalentSphereAPI.Services;
using static QuestPDF.Helpers.Colors;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/v1/live-classes")]
    [Authorize]
    public class LiveClassesController : ControllerBase
    {
        private readonly ILiveClassService _service;
        private readonly IAttendanceService _attendanceService;

        public LiveClassesController(
            ILiveClassService service,
            IAttendanceService attendanceService)
        {
            _service = service;
            _attendanceService = attendanceService;
        }

        // =========================================================
        // GET ALL
        // =========================================================

        [HttpGet]
        [HasPermission("LiveClass", "View")]
        public async Task<IActionResult> GetAll(
            [FromQuery] LiveClassQueryParameters query)
        {
            var (items, total) =
                await _service.GetAllAsync(query);

            return Ok(new
            {
                success = true,
                message = "Live classes fetched successfully.",
                data = items,
                page = query.Page,
                pageSize = query.PageSize,
                totalRecords = total
            });
        }

        // =========================================================
        // GET BY ID
        // =========================================================

        [HttpGet("{id:int}")]
        [HasPermission("LiveClass", "View")]
        public async Task<IActionResult> GetById(int id)
        {
            var item =
                await _service.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Live class not found."
                });
            }

            return Ok(new
            {
                success = true,
                data = item
            });
        }

        // =========================================================
        // CREATE
        // =========================================================
        //
        // BOTH Organization and Mentor can schedule.
        //
        // Authorization is controlled by:
        // [Authorize]
        // [HasPermission("LiveClass", "Add")]
        //
        // The service determines the correct MentorId from
        // the selected Batch instead of trusting the frontend.
        // =========================================================

        [HttpPost]
        [HasPermission("LiveClass", "Add")]
        public async Task<IActionResult> Create(
            [FromBody] CreateLiveClassDto dto)
        {
            try
            {
                var result =
                    await _service.CreateAsync(dto);

                return Ok(new
                {
                    success = true,
                    message = "Live class scheduled successfully.",
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
            catch (Exception ex)
            {
                return Conflict(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // =========================================================
        // UPDATE
        // =========================================================

        [HttpPut("{id:int}")]
        [HasPermission("LiveClass", "Edit")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateLiveClassDto dto)
        {
            try
            {
                var updated =
                    await _service.UpdateAsync(id, dto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Live class not found."
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Live class updated successfully."
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
            catch (Exception ex)
            {
                return Conflict(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // =========================================================
        // DELETE
        // =========================================================

        [HttpDelete("{id:int}")]
        [HasPermission("LiveClass", "Delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted =
                await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Live class not found."
                });
            }

            return Ok(new
            {
                success = true,
                message = "Live class deleted successfully."
            });
        }

        // =========================================================
        // START CLASS
        // =========================================================

        [HttpPut("{id:int}/start")]
        [HasPermission("LiveClass", "Edit")]
        public async Task<IActionResult> Start(int id)
        {
            var ok =
                await _service.StartClassAsync(id);

            if (!ok)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Live class not found."
                });
            }

            return Ok(new
            {
                success = true,
                message = "Class started."
            });
        }

        // =========================================================
        // END CLASS
        // =========================================================

        [HttpPut("{id:int}/end")]
        [HasPermission("LiveClass", "Edit")]
        public async Task<IActionResult> End(int id)
        {
            var ok =
                await _service.EndClassAsync(id);

            if (!ok)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Live class not found."
                });
            }

            return Ok(new
            {
                success = true,
                message = "Class completed."
            });
        }

        // =========================================================
        // CANCEL CLASS
        // =========================================================

        [HttpPut("{id:int}/cancel")]
        [HasPermission("LiveClass", "Edit")]
        public async Task<IActionResult> Cancel(int id)
        {
            var ok =
                await _service.CancelClassAsync(id);

            if (!ok)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Live class not found."
                });
            }

            return Ok(new
            {
                success = true,
                message = "Class cancelled."
            });
        }

        // =========================================================
        // TODAY'S CLASSES
        // =========================================================

        [HttpGet("today")]
        [HasPermission("LiveClass", "View")]
        public async Task<IActionResult> GetTodaysClasses()
        {
            var result =
                await _service.GetTodaysClassesAsync();

            return Ok(new
            {
                success = true,
                message = "Today's live classes fetched successfully.",
                data = result
            });
        }

        // =========================================================
        // STUDENT JOIN LIVE CLASS
        // =========================================================
        //
        // IMPORTANT:
        //
        // Student Join now does TWO things:
        //
        // 1. Validates the student and gets the meeting URL.
        // 2. Creates an AttendanceSession immediately.
        //
        //Later, the meeting provider attendance event can
        //replace the provisional session with the real
        //participant information.
                // =========================================================

        [HttpPost("{liveClassId:int}/join")]
[Authorize(Roles = "Student")]
public async Task<IActionResult> JoinLiveClass(
    int liveClassId)
        {
            try
            {
                var result =
                    await _service.JoinLiveClassAsync(
                        liveClassId);

                await _attendanceService
                    .MarkStudentJoinedAsync(
                        liveClassId);

                return Ok(new
                {
                    success = true,
                    message =
                        "Live class joined successfully.",
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
            catch (Exception ex)
            {
                return Conflict(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }


    }
}