namespace TalentSphereAPI.DTOs.EmployeeAttendance
{
    public class AttendanceCorrectionRequestDto
    {
        public int EmployeeAttendanceId { get; set; }

        public DateTime? RequestedCheckIn { get; set; }

        public DateTime? RequestedCheckOut { get; set; }

        public string Reason { get; set; } = string.Empty;
    }
}