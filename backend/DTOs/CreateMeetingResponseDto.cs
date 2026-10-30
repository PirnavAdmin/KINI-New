namespace TalentSphereAPI.DTOs
{
    public class CreateMeetingResponseDto
    {
        public string MeetingId { get; set; } = string.Empty;

        public string JoinUrl { get; set; } = string.Empty;

        public string HostUrl { get; set; } = string.Empty;

        public string MeetingPassword { get; set; } = string.Empty;

        public string Provider { get; set; } = string.Empty;

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }
    }
}