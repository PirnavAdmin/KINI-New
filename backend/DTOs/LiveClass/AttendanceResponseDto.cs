namespace TalentSphereAPI.DTOs.Attendance

{

    public class AttendanceResponseDto

    {

        public int AttendanceId { get; set; }

        public int StudentId { get; set; }

        public string StudentName { get; set; } = string.Empty;

        public string? StudentProfilePhotoUrl { get; set; }

        public bool IsPresent { get; set; }

        public DateTime JoinedAt { get; set; }

        public DateTime? LeftAt { get; set; }

    }

}
