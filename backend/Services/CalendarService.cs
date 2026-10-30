using TalentSphereAPI.DTOs.Calendar;

using TalentSphereAPI.Repositories.Interfaces;

using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services

{

    public class CalendarService : ICalendarService

    {

        private readonly ICalendarRepository _calendarRepository;

        public CalendarService(ICalendarRepository calendarRepository)

        {

            _calendarRepository = calendarRepository;

        }



        public async Task<List<CalendarEventDto>> GetMonthEventsAsync(int year, int month)

        {

            return await _calendarRepository.GetMonthEventsAsync(year, month);

        }

        public async Task<WeekScheduleDto> GetWeekEventsAsync(DateTime date)

        {

            return await _calendarRepository.GetWeekEventsAsync(date);

        }

        public async Task<DayScheduleDto> GetDayScheduleAsync(DateTime date)

        {

            return await _calendarRepository.GetDayScheduleAsync(date);

        }

        public async Task<List<DayEventDto>> GetTodayAgendaAsync()

        {

            return await _calendarRepository.GetTodayAgendaAsync();

        }

        public async Task<List<UpcomingEventDto>> GetUpcomingEventsAsync(int count)

        {

            return await _calendarRepository.GetUpcomingEventsAsync(count);

        }

        public async Task<EventDetailsDto?> GetEventDetailsAsync(int eventId)

        {

            return await _calendarRepository.GetEventDetailsAsync(eventId);

        }

    }

}
