namespace TalentSphereAPI.DTOs.Attendance
{
    public class AttendancePercentageDto
    {
        public int TotalClasses { get; set; }

        public int Present { get; set; }

        public double Percentage { get; set; }
    }
}