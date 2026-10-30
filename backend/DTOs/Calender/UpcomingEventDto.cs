namespace TalentSphereAPI.DTOs.Calendar

{

    public class UpcomingEventDto

    {

        public int EventId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string EventType { get; set; } = string.Empty;

        public DateTime Date { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public string BadgeColor { get; set; } = string.Empty;

    }

}
