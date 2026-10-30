namespace TalentSphereAPI.DTOs.Dashboard
{
    public class TodayClassDto
    {
        public int LiveClassId { get; set; }

        public string ClassTitle { get; set; } = string.Empty;

        public string BatchName { get; set; } = string.Empty;

        public DateTime ScheduledDate { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}