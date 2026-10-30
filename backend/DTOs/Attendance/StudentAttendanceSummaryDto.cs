namespace TalentSphereAPI.DTOs.Attendance
{
    public class StudentAttendanceSummaryDto
    {
        public int TotalClasses { get; set; }

        public int Present { get; set; }

        public int Late { get; set; }

        public int Absent { get; set; }

        public decimal AveragePercentage { get; set; }
    }
}