namespace TalentSphereAPI.DTOs.LiveClass

{

    public class LiveClassDashboardDto

    {

        public int TotalClasses { get; set; }

        public int ScheduledClasses { get; set; }

        public int LiveClasses { get; set; }

        public int CompletedClasses { get; set; }

        public int CancelledClasses { get; set; }

        public int TotalAttendance { get; set; }

        public double AverageAttendance { get; set; }

        // New Fields

        public int TotalStudents { get; set; }

        public int PresentStudents { get; set; }

        public int AbsentStudents { get; set; }

        public double AttendancePercentage { get; set; }

    }

}
