namespace TalentSphereAPI.DTOs.LiveClass

{

    public class LiveClassResponseDto

    {

        public int LiveClassId { get; set; }

        public string ClassTitle { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int CourseId { get; set; }

        public string CourseName { get; set; } = string.Empty;

        public int BatchId { get; set; }

        public string BatchName { get; set; } = string.Empty;

        public int MentorId { get; set; }

        public string MentorName { get; set; } = string.Empty;

        public string? MentorProfilePhotoUrl { get; set; }
        public DateTime ScheduledDate { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public string MeetingPlatform { get; set; } = string.Empty;

        public string? MeetingLink { get; set; }

        public bool RecordingEnabled { get; set; }

        public string Status { get; set; } = string.Empty;

        public int AttendanceCount { get; set; }

    }

}
