namespace TalentSphereAPI.DTOs.EmployeeAttendance
{
    public class AttendanceResponseDto
    {
        public int EmployeeAttendanceId { get; set; }

        public int EmployeeId { get; set; }

        public string EmployeeName { get; set; } = string.Empty;

        public DateOnly AttendanceDate { get; set; }

        public DateTime? CheckIn { get; set; }

        public DateTime? CheckOut { get; set; }

        public decimal WorkingHours { get; set; }
    }
}