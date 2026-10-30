namespace TalentSphereAPI.DTOs.EmployeeAttendance
{
    public class AttendanceFilterDto
    {
        public int? EmployeeId { get; set; }

        public DateOnly? Date { get; set; }

        public DateOnly? FromDate { get; set; }

        public DateOnly? ToDate { get; set; }

        
    }
}