namespace TalentSphereAPI.DTOs.Attendance
{
    public class BulkAttendanceDto
    {
        public int LiveClassId { get; set; }

        public List<AttendanceStudentDto> Students { get; set; } = new();
    }
}