namespace TalentSphereAPI.DTOs.Calendar

{

    public class WeekScheduleDto

    {

        public DateTime WeekStartDate { get; set; }

        public DateTime WeekEndDate { get; set; }

        public List<CalendarEventDto> Events { get; set; } = new();

    }

}
