namespace TalentSphereAPI.DTOs.Calendar

{

    public class DayScheduleDto

    {

        public DateTime Date { get; set; }

        public List<DayEventDto> Events { get; set; } = new();

    }

}
