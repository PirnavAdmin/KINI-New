using TalentSphereAPI.Models;

namespace TalentSphereAPI.DTOs.Attendance
{
    public class UpdateAttendanceDto
    {
        public AttendanceStatus Status { get; set; }

        public TimeOnly? JoinTime { get; set; }

        public TimeOnly? LeaveTime { get; set; }

        public string? Remarks { get; set; }
    }
}