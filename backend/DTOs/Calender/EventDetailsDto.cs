namespace TalentSphereAPI.DTOs.Calendar

{

    public class EventDetailsDto

    {

        public int EventId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string EventType { get; set; } = string.Empty;

        public DateTime Date { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public string CourseName { get; set; } = string.Empty;

        public string BatchName { get; set; } = string.Empty;

        public string MentorName { get; set; } = string.Empty;

        public string? MentorProfilePhotoUrl { get; set; }

        public string MeetingPlatform { get; set; } = string.Empty;

        public string MeetingLink { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public bool CanJoin { get; set; }

        public bool HasRecording { get; set; }

        public string? RecordingUrl { get; set; }

        public string BadgeColor { get; set; } = string.Empty;

    }

}
