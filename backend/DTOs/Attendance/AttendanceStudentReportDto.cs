namespace TalentSphereAPI.DTOs.Attendance
{
    public class AttendanceStudentReportDto
    {
        public int StudentId { get; set; }

        public string StudentName { get; set; } = string.Empty;

        public string? StudentProfilePhotoUrl { get; set; }
        public string Status { get; set; } = string.Empty;

        public decimal AttendancePercentage { get; set; }

        public int DurationMinutes { get; set; }

        public DateTime? FirstJoinTime { get; set; }

        public DateTime? LastLeaveTime { get; set; }
    }
}