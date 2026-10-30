namespace TalentSphereAPI.DTOs.EmployeeAttendance
{
    public class AttendanceReportDto
    {
        public int EmployeeId { get; set; }

        public string EmployeeName { get; set; } = string.Empty;

        public int TotalWorkingDays { get; set; }

        public int PresentDays { get; set; }

        public int LateDays { get; set; }

        public int AbsentDays { get; set; }

        public int LeaveDays { get; set; }

        public decimal TotalWorkingHours { get; set; }

        public decimal AverageWorkingHours { get; set; }
    }
}