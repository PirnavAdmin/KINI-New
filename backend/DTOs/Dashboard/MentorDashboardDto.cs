namespace TalentSphereAPI.DTOs.Dashboard
{
    public class MentorDashboardDto
    {
        public int MentorId { get; set; }

        public string MentorName { get; set; } = string.Empty;

        public string? ProfilePhotoUrl { get; set; }

        public int TodayClasses { get; set; }

        public int LiveClasses { get; set; }

        public int UpcomingClasses { get; set; }

        public int CompletedClasses { get; set; }

        public int TotalStudents { get; set; }

        public decimal AverageAttendance { get; set; }

        // Optional but recommended
        public int TotalCourses { get; set; }

        public int TotalBatches { get; set; }
    }
}