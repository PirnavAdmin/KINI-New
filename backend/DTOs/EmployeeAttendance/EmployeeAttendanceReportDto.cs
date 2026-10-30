namespace TalentSphereAPI.DTOs.EmployeeAttendance
{
    public class EmployeeAttendanceReportDto
    {
        public int EmployeeId { get; set; }

        public string EmployeeName { get; set; } = string.Empty;

        public int TotalWorkingDays { get; set; }

        public decimal TotalWorkingHours { get; set; }

        public decimal AverageWorkingHours { get; set; }
    }
}