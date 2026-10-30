namespace TalentSphereAPI.DTOs.Attendance
{
    public class AttendanceDashboardDto
    {
        public int TotalStudents { get; set; }

        public int PresentStudents { get; set; }

        public int AbsentStudents { get; set; }

        public int LateStudents { get; set; }

        public int LeaveStudents { get; set; }

        public int HalfDayStudents { get; set; }

        public double AttendancePercentage { get; set; }
    }
}