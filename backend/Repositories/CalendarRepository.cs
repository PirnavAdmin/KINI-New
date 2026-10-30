using Microsoft.EntityFrameworkCore;

using TalentSphereAPI.Data;

using TalentSphereAPI.DTOs.Calendar;

using TalentSphereAPI.Models;

using TalentSphereAPI.Repositories.Interfaces;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Repositories

{

    public class CalendarRepository : ICalendarRepository

    {

        private readonly ApplicationDbContext _context;
        private readonly DateTimeService _dateTimeService;

        public CalendarRepository(
            ApplicationDbContext context,
            DateTimeService dateTimeService)
        {
            _context = context;
            _dateTimeService = dateTimeService;
        }
        private string GetEventStatus(LiveClass liveClass)

        {

            var now = _dateTimeService.Now();
            var today = now.Date;
            var currentTime = now.TimeOfDay;

            if (liveClass.Status == "Cancelled")

                return "Cancelled";

            if (liveClass.ScheduledDate.Date < today)

                return "Completed";

            if (liveClass.ScheduledDate.Date > today)

                return "Upcoming";

            if (currentTime < liveClass.StartTime)

                return "Upcoming";

            if (currentTime <= liveClass.EndTime)

                return "Ongoing";

            return "Completed";

        }



        public async Task<List<CalendarEventDto>> GetMonthEventsAsync(int year, int month)

        {

            var classes = await _context.LiveClasses

                .Include(x => x.Course)

                .Include(x => x.Batch)

                .Include(x => x.Mentor)

                .Where(x => x.ScheduledDate.Year == year &&

                            x.ScheduledDate.Month == month)

                .OrderBy(x => x.ScheduledDate)

                .ThenBy(x => x.StartTime)

                .Select(x => new CalendarEventDto

                {

                    EventId = x.LiveClassId,

                    Date = x.ScheduledDate,

                    StartTime = x.StartTime,

                    EndTime = x.EndTime,

                    Title = x.ClassTitle,

                    EventType = "Live Class",

                    Status = x.Status,

                    Color =

                        x.Status == "Completed" ? "#22C55E" :

                        x.Status == "Cancelled" ? "#EF4444" :

                        x.Status == "Ongoing" ? "#3B82F6" :

                        "#F59E0B"

                })

                .ToListAsync();

            return classes;

        }

        public async Task<WeekScheduleDto> GetWeekEventsAsync(DateTime date)

        {

            var startOfWeek = date.Date.AddDays(-(int)date.DayOfWeek);

            var endOfWeek = startOfWeek.AddDays(6);

            var events = await _context.LiveClasses

                .Where(x => x.ScheduledDate.Date >= startOfWeek &&

                            x.ScheduledDate.Date <= endOfWeek)

                .OrderBy(x => x.ScheduledDate)

                .ThenBy(x => x.StartTime)

                .Select(x => new CalendarEventDto

                {

                    EventId = x.LiveClassId,

                    Date = x.ScheduledDate,

                    StartTime = x.StartTime,

                    EndTime = x.EndTime,

                    Title = x.ClassTitle,

                    EventType = "Live Class",

                    Status = x.Status,

                    Color =

                        x.Status == "Completed" ? "#22C55E" :

                        x.Status == "Cancelled" ? "#EF4444" :

                        x.Status == "Ongoing" ? "#3B82F6" :

                        "#F59E0B"

                })

                .ToListAsync();

            return new WeekScheduleDto

            {

                WeekStartDate = startOfWeek,

                WeekEndDate = endOfWeek,

                Events = events

            };

        }

        public async Task<DayScheduleDto> GetDayScheduleAsync(DateTime date)

        {

            var today = DateTime.Today;

            var currentTime = DateTime.Now.TimeOfDay;

            var events = await _context.LiveClasses

                .Include(x => x.Course)

                .Include(x => x.Batch)

                .Include(x => x.Mentor)

                .Where(x => x.ScheduledDate.Date == date.Date)

                .OrderBy(x => x.StartTime)

                .ToListAsync();

            var result = events.Select(x =>

            {

                var status = GetEventStatus(x);


                return new DayEventDto

                {

                    EventId = x.LiveClassId,

                    Title = x.ClassTitle,

                    Description = x.Description ?? string.Empty,

                    EventType = "Live Class",

                    Date = x.ScheduledDate,

                    StartTime = x.StartTime,

                    EndTime = x.EndTime,

                    CourseName = x.Course.CourseName,

                    BatchName = x.Batch.BatchName,

                    MentorName = $"{x.Mentor.FirstName} {x.Mentor.LastName}",

                    MeetingPlatform = x.MeetingPlatform,

                    MeetingLink = x.MeetingLink ?? string.Empty,

                    Status = status,

                    CanJoin = status == "Ongoing",

                    IsCompleted = status == "Completed",

                    HasRecording = !string.IsNullOrWhiteSpace(x.RecordingUrl),

                    RecordingUrl = x.RecordingUrl ?? string.Empty,

                    BadgeColor =

                        status == "Completed" ? "#22C55E" :

                        status == "Cancelled" ? "#EF4444" :

                        status == "Ongoing" ? "#3B82F6" :

                        "#F59E0B"

                };

            }).ToList();

            return new DayScheduleDto

            {

                Date = date.Date,

                Events = result

            };

        }

        public async Task<List<DayEventDto>> GetTodayAgendaAsync()

        {

            return (await GetDayScheduleAsync(DateTime.Today)).Events;

        }

        public async Task<List<UpcomingEventDto>> GetUpcomingEventsAsync(int count)

        {

            return await _context.LiveClasses

                .Where(x => x.ScheduledDate.Date >= DateTime.Today &&

                            x.Status != "Cancelled")

                .OrderBy(x => x.ScheduledDate)

                .ThenBy(x => x.StartTime)

                .Take(count)

                .Select(x => new UpcomingEventDto

                {

                    EventId = x.LiveClassId,

                    Title = x.ClassTitle,

                    EventType = "Live Class",

                    Date = x.ScheduledDate,

                    StartTime = x.StartTime,

                    EndTime = x.EndTime,

                    BadgeColor = "#F59E0B"

                })

                .ToListAsync();

        }

        public async Task<EventDetailsDto?> GetEventDetailsAsync(int eventId)

        {

            var liveClass = await _context.LiveClasses

                .Include(x => x.Course)

                .Include(x => x.Batch)

                .Include(x => x.Mentor)

                .FirstOrDefaultAsync(x => x.LiveClassId == eventId);

            if (liveClass == null)

                return null;

            var today = DateTime.Today;

            var currentTime = DateTime.Now.TimeOfDay;

            var status = GetEventStatus(liveClass);

            return new EventDetailsDto

            {

                EventId = liveClass.LiveClassId,

                Title = liveClass.ClassTitle,

                Description = liveClass.Description ?? string.Empty,

                EventType = "Live Class",

                Date = liveClass.ScheduledDate,

                StartTime = liveClass.StartTime,

                EndTime = liveClass.EndTime,

                CourseName = liveClass.Course.CourseName,

                BatchName = liveClass.Batch.BatchName,

                MentorName = $"{liveClass.Mentor.FirstName} {liveClass.Mentor.LastName}",

                MeetingPlatform = liveClass.MeetingPlatform,

                MeetingLink = liveClass.MeetingLink ?? string.Empty,

                Status = status,

                CanJoin = status == "Ongoing",

                HasRecording = !string.IsNullOrWhiteSpace(liveClass.RecordingUrl),

                RecordingUrl = liveClass.RecordingUrl,

                BadgeColor =

                    status == "Completed" ? "#22C55E" :

                    status == "Cancelled" ? "#EF4444" :

                    status == "Ongoing" ? "#3B82F6" :

                    "#F59E0B"

            };

        }


    }

}
