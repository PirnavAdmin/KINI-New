using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public class AttendanceSession
    {
        [Key]
        public int AttendanceSessionId { get; set; }

        public int AttendanceId { get; set; }

        public Attendance Attendance { get; set; } = null!;

        public DateTime JoinedAt { get; set; }

        public DateTime? LeftAt { get; set; }

        public int DurationMinutes { get; set; }

        public string MeetingParticipantId { get; set; } = string.Empty;

        public string ParticipantEmail { get; set; } = string.Empty;

        public string ParticipantName { get; set; } = string.Empty;

        public bool IsCompleted { get; set; }
    }
}