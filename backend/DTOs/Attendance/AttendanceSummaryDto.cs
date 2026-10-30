namespace TalentSphereAPI.DTOs.Dashboard
{
    public class AttendanceSummaryDto
    {
        public int PresentStudents { get; set; }

        public int LateStudents { get; set; }

        public int AbsentStudents { get; set; }

        public decimal AverageAttendance { get; set; }
    }
}