using Microsoft.AspNetCore.Mvc;

using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Controllers

{

    [ApiController]

    //[ApiVersion("1.0")]

    [Route("api/[controller]")]

    public class CalendarController : ControllerBase

    {

        private readonly ICalendarService _calendarService;

        public CalendarController(ICalendarService calendarService)

        {

            _calendarService = calendarService;

        }



        /// <summary>

        /// Gets all calendar events for a specific month.

        /// </summary>

        /// <param name="year">Year</param>

        /// <param name="month">Month (1-12)</param>

        [HttpGet("month")]

        public async Task<IActionResult> GetMonthEvents(

            [FromQuery] int year,

            [FromQuery] int month)

        {

            if (month < 1 || month > 12)

                return BadRequest("Month must be between 1 and 12.");

            var result = await _calendarService.GetMonthEventsAsync(year, month);

            return Ok(result);

        }

        /// <summary>

        /// Gets all events for a week.

        /// </summary>

        /// <param name="date">Any date within the week.</param>

        [HttpGet("week")]

        public async Task<IActionResult> GetWeekEvents([FromQuery] DateTime date)

        {

            var result = await _calendarService.GetWeekEventsAsync(date);

            return Ok(result);

        }

        /// <summary>

        /// Gets all events for a selected day.

        /// </summary>

        /// <param name="date">Selected date.</param>

        [HttpGet("day")]

        public async Task<IActionResult> GetDaySchedule([FromQuery] DateTime date)

        {

            var result = await _calendarService.GetDayScheduleAsync(date);

            return Ok(result);

        }

        /// <summary>

        /// Gets today's agenda.

        /// </summary>

        [HttpGet("today")]

        public async Task<IActionResult> GetTodayAgenda()

        {

            var result = await _calendarService.GetTodayAgendaAsync();

            return Ok(result);

        }

        /// <summary>

        /// Gets upcoming calendar events.

        /// </summary>

        /// <param name="count">Number of events.</param>

        [HttpGet("upcoming")]

        public async Task<IActionResult> GetUpcomingEvents([FromQuery] int count = 5)

        {

            var result = await _calendarService.GetUpcomingEventsAsync(count);

            return Ok(result);

        }

        /// <summary>

        /// Gets complete details of an event.

        /// </summary>

        /// <param name="eventId">Live Class Id</param>

        [HttpGet("event/{eventId}")]

        public async Task<IActionResult> GetEventDetails(int eventId)

        {

            var result = await _calendarService.GetEventDetailsAsync(eventId);

            if (result == null)

                return NotFound("Event not found.");

            return Ok(result);

        }

    }

}
