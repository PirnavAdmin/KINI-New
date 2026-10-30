using TalentSphereAPI.Models;

namespace TalentSphereAPI.DTOs.Attendance
{
    public class AttendanceDto
    {
        public int AttendanceId { get; set; }

        public int StudentId { get; set; }

        public string StudentName { get; set; } = string.Empty;

        public int BatchId { get; set; }

        public string BatchName { get; set; } = string.Empty;

        public int CourseId { get; set; }

        public string CourseName { get; set; } = string.Empty;

        public int MentorId { get; set; }

        public string MentorName { get; set; } = string.Empty;

        public string? StudentProfilePhotoUrl { get; set; }

        public string? MentorProfilePhotoUrl { get; set; }

        public int LiveClassId { get; set; }

        public DateOnly AttendanceDate { get; set; }

        public AttendanceStatus Status { get; set; }

        public TimeOnly? JoinTime { get; set; }

        public TimeOnly? LeaveTime { get; set; }

        public int DurationInMinutes { get; set; }

        public string? Remarks { get; set; }
    }
}