using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers;

[ApiController]
[Route("api/hr/calendar")]
[Authorize]
public class HrCalendarController : ControllerBase
{
    private readonly IHrCalendarService _calendarService;

    public HrCalendarController(
        IHrCalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    // ============================================================
    // GET /api/hr/calendar/events
    // ============================================================

    [HttpGet("events")]
    [HasPermission("Calendar", "view")]
    public async Task<IActionResult> GetEvents(
        [FromQuery] HrCalendarQueryDto query)
    {
        try
        {
            var result =
                await _calendarService.GetEventsAsync(query);

            var pageNumber =
                query.PageNumber < 1 ? 1 : query.PageNumber;

            var pageSize =
                query.PageSize < 1 ? 50 :
                query.PageSize > 200 ? 200 :
                query.PageSize;

            return Ok(new
            {
                items = result.Items,
                page = pageNumber,
                limit = pageSize,
                totalCount = result.TotalCount,
                totalPages =
                    result.TotalCount == 0
                        ? 0
                        : (int)Math.Ceiling(
                            result.TotalCount /
                            (double)pageSize)
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                error = new
                {
                    code = "VALIDATION_ERROR",
                    message = ex.Message
                }
            });
        }
    }


    // ============================================================
    // GET /api/hr/calendar/events/{eventId}
    // ============================================================

    [HttpGet("events/{eventId:int}")]
    [HasPermission("Calendar", "view")]
    public async Task<IActionResult> GetEvent(
        int eventId)
    {
        var result =
            await _calendarService.GetEventByIdAsync(eventId);

        if (result == null)
        {
            return NotFound(new
            {
                error = new
                {
                    code = "NOT_FOUND",
                    message = "Calendar event not found."
                }
            });
        }

        return Ok(result);
    }


    // ============================================================
    // POST /api/hr/calendar/events
    // ============================================================

    [HttpPost("events")]
    [HasPermission("Calendar", "add")]
    public async Task<IActionResult> CreateEvent(
        [FromBody] HrCalendarEventCreateDto dto)
    {
        try
        {
            var eventId =
                await _calendarService.CreateEventAsync(dto);

            var created =
                await _calendarService.GetEventByIdAsync(eventId);

            return CreatedAtAction(
                nameof(GetEvent),
                new { eventId },
                created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                error = new
                {
                    code = "VALIDATION_ERROR",
                    message = ex.Message
                }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                error = new
                {
                    code = "VALIDATION_ERROR",
                    message = ex.Message
                }
            });
        }
    }


    // ============================================================
    // PUT /api/hr/calendar/events/{eventId}
    // ============================================================

    [HttpPut("events/{eventId:int}")]
    [HasPermission("Calendar", "edit")]
    public async Task<IActionResult> UpdateEvent(
        int eventId,
        [FromBody] HrCalendarEventUpdateDto dto)
    {
        try
        {
            var updated =
                await _calendarService.UpdateEventAsync(
                    eventId,
                    dto);

            if (!updated)
            {
                return NotFound(new
                {
                    error = new
                    {
                        code = "NOT_FOUND",
                        message = "Calendar event not found."
                    }
                });
            }

            var result =
                await _calendarService.GetEventByIdAsync(eventId);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                error = new
                {
                    code = "VALIDATION_ERROR",
                    message = ex.Message
                }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                error = new
                {
                    code = "VALIDATION_ERROR",
                    message = ex.Message
                }
            });
        }
    }


    // ============================================================
    // DELETE /api/hr/calendar/events/{eventId}
    // ============================================================

    [HttpDelete("events/{eventId:int}")]
    [HasPermission("Calendar", "delete")]
    public async Task<IActionResult> DeleteEvent(
        int eventId)
    {
        var deleted =
            await _calendarService.DeleteEventAsync(eventId);

        if (!deleted)
        {
            return NotFound(new
            {
                error = new
                {
                    code = "NOT_FOUND",
                    message = "Calendar event not found."
                }
            });
        }

        return Ok(new
        {
            success = true
        });
    }


    // ============================================================
    // GET /api/hr/calendar/events/upcoming
    // ============================================================

    [HttpGet("events/upcoming")]
    [HasPermission("Calendar", "view")]
    public async Task<IActionResult> GetUpcomingEvents(
        [FromQuery] int limit = 5)
    {
        if (limit < 1)
            limit = 5;

        if (limit > 100)
            limit = 100;

        var events =
            await _calendarService.GetUpcomingEventsAsync(7);

        return Ok(new
        {
            items = events.Take(limit)
        });
    }


    // ============================================================
    // GET /api/hr/calendar/events/stats
    // ============================================================

    [HttpGet("events/stats")]
    [HasPermission("Calendar", "view")]
    public async Task<IActionResult> GetStats()
    {
        var stats =
            await _calendarService.GetStatsAsync();

        return Ok(new
        {
            eventsThisMonth = stats.TotalEvents,
            classesScheduled = stats.ClassEvents,
            meetings = stats.MeetingEvents,
            holidays = stats.HolidayEvents,
            leaveEvents = stats.LeaveEvents
        });
    }


    // ============================================================
    // GET /api/hr/calendar/holidays
    // ============================================================

    [HttpGet("holidays")]
    [HasPermission("Calendar", "view")]
    public async Task<IActionResult> GetHolidays(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var holidays =
            await _calendarService.GetHolidaysAsync(
                fromDate,
                toDate);

        return Ok(new
        {
            items = holidays
        });
    }


    // ============================================================
    // GET /api/hr/calendar/leaves
    // ============================================================

    [HttpGet("leaves")]
    [HasPermission("Calendar", "view")]
    public async Task<IActionResult> GetLeaves(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var leaves =
            await _calendarService.GetLeavesAsync(
                fromDate,
                toDate);

        return Ok(new
        {
            items = leaves
        });
    }


    // ============================================================
    // GET /api/hr/calendar/classes
    // ============================================================

    [HttpGet("classes")]
    [HasPermission("Calendar", "view")]
    public async Task<IActionResult> GetClasses(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var classes =
            await _calendarService.GetClassesAsync(
                fromDate,
                toDate);

        return Ok(new
        {
            items = classes
        });
    }
}