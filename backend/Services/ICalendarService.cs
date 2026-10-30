using TalentSphereAPI.DTOs.Calendar;

namespace TalentSphereAPI.Services.Interfaces

{

    public interface ICalendarService

    {

        Task<List<CalendarEventDto>> GetMonthEventsAsync(int year, int month);

        Task<WeekScheduleDto> GetWeekEventsAsync(DateTime date);

        Task<DayScheduleDto> GetDayScheduleAsync(DateTime date);

        Task<List<DayEventDto>> GetTodayAgendaAsync();

        Task<List<UpcomingEventDto>> GetUpcomingEventsAsync(int count);

        Task<EventDetailsDto?> GetEventDetailsAsync(int eventId);

    }

}
