namespace TalentSphereAPI.DTOs.Calendar

{

    public class CalendarEventDto

    {

        public int EventId { get; set; }

        public DateTime Date { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public string Title { get; set; } = string.Empty;

        public string EventType { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public string Color { get; set; } = string.Empty;

    }

}
