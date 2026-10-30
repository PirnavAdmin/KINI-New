using TalentSphereAPI.DTOs.HR;

namespace TalentSphereAPI.Services;

public interface IHrCalendarService
{
    Task<(IEnumerable<HrCalendarEventDto> Items, int TotalCount)>
        GetEventsAsync(HrCalendarQueryDto query);

    Task<HrCalendarEventDto?> GetEventByIdAsync(int eventId);

    Task<int> CreateEventAsync(HrCalendarEventCreateDto dto);

    Task<bool> UpdateEventAsync(
        int eventId,
        HrCalendarEventUpdateDto dto);

    Task<bool> DeleteEventAsync(int eventId);

    Task<IEnumerable<HrCalendarEventDto>>
        GetUpcomingEventsAsync(int days = 7);

    Task<HrCalendarStatsDto>
        GetStatsAsync();

    Task<IEnumerable<HrCalendarHolidayDto>>
        GetHolidaysAsync(
            DateTime? fromDate,
            DateTime? toDate);

    Task<IEnumerable<HrCalendarLeaveDto>>
        GetLeavesAsync(
            DateTime? fromDate,
            DateTime? toDate);

    Task<IEnumerable<HrCalendarClassDto>>
        GetClassesAsync(
            DateTime? fromDate,
            DateTime? toDate);
}