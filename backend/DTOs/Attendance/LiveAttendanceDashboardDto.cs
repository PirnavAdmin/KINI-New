namespace TalentSphereAPI.DTOs.Attendance
{
    public class LiveAttendanceDashboardDto
    {
        public int LiveClassId { get; set; }

        public int PresentCount { get; set; }

        public int LateCount { get; set; }

        public int AbsentCount { get; set; }

        public decimal AverageAttendance { get; set; }

        public List<LiveAttendanceStudentDto> Students { get; set; }
            = new();
    }
}