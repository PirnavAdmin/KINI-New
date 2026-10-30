namespace TalentSphereAPI.DTOs.LiveClass

{

    public class JoinLiveClassResponseDto

    {

        public int LiveClassId { get; set; }

        public string ClassTitle { get; set; } = string.Empty;

        public string MeetingPlatform { get; set; } = string.Empty;

        public string MeetingUrl { get; set; } = string.Empty;

        public string? MeetingId { get; set; }

        public string? MeetingPassword { get; set; }

        public DateTime ScheduledDate { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public string Status { get; set; } = string.Empty;

    }

}
