namespace TalentSphereAPI.DTOs.LiveClass
{
    public class LiveClassListDto
    {
        public int LiveClassId { get; set; }

        public int CourseId { get; set; }

        public int BatchId { get; set; }

        public int MentorId { get; set; }

        public string ClassTitle { get; set; } = string.Empty;

        public string CourseName { get; set; } = string.Empty;

        public string BatchName { get; set; } = string.Empty;

        public string MentorName { get; set; } = string.Empty;

        public string? MentorProfilePhotoUrl { get; set; }

        public DateTime ScheduledDate { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public string Status { get; set; } = string.Empty;

        public int AttendanceCount { get; set; }
    }
}