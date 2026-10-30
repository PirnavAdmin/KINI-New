namespace TalentSphereAPI.DTOs.Attendance
{
    public class AttendanceReportDto
    {
        public int LiveClassId { get; set; }

        public string ClassTitle { get; set; } = string.Empty;

        public string CourseName { get; set; } = string.Empty;

        public string BatchName { get; set; } = string.Empty;

        public string MentorName { get; set; } = string.Empty;

        public string? MentorProfilePhotoUrl { get; set; }

        public DateTime ScheduledDate { get; set; }

        public int TotalStudents { get; set; }

        public int PresentStudents { get; set; }

        public int LateStudents { get; set; }

        public int AbsentStudents { get; set; }

        public decimal AverageAttendance { get; set; }

        public List<AttendanceStudentReportDto> Students { get; set; }
            = new();
    }
}