using TalentSphereAPI.Models;

namespace TalentSphereAPI.DTOs.Attendance
{
    public class AttendanceHistoryDto
    {
        public DateOnly AttendanceDate { get; set; }

        public string CourseName { get; set; } = string.Empty;

        public string BatchName { get; set; } = string.Empty;

        public string LiveClassTitle { get; set; } = string.Empty;

        public AttendanceStatus Status { get; set; }

        public int DurationInMinutes { get; set; }
    }
}