namespace TalentSphereAPI.DTOs.Mentor
{
    public class MentorClassDto
    {
        public int LiveClassId { get; set; }

        public string ClassTitle { get; set; } = string.Empty;

        public int CourseId { get; set; }

        public string CourseName { get; set; } = string.Empty;

        public int BatchId { get; set; }

        public string BatchName { get; set; } = string.Empty;

        public DateTime ScheduledDate { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public string Status { get; set; } = string.Empty;

        public string MeetingPlatform { get; set; } = string.Empty;

        public string MeetingLink { get; set; } = string.Empty;

        public bool RecordingEnabled { get; set; }

        public string? RecordingUrl { get; set; }
    }
}