using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public class LiveClass
    {
        [Key]
        public int LiveClassId { get; set; }

        [Required]
        [MaxLength(200)]
        public string ClassTitle { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        public int CourseId { get; set; }

        [Required]
        public int BatchId { get; set; }

        [Required]
        public int MentorId { get; set; }

        [Required]
        public DateTime ScheduledDate { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        // ============================
        // Meeting Details
        // ============================

        [Required]
        [MaxLength(50)]
        public string MeetingPlatform { get; set; } = string.Empty; // Zoom / Teams

        [MaxLength(500)]
        public string? MeetingLink { get; set; }

        [MaxLength(500)]
        public string? HostLink { get; set; }

        [MaxLength(100)]
        public string? MeetingId { get; set; }

        [MaxLength(100)]
        public string? MeetingPassword { get; set; }

        // ============================
        // Recording
        // ============================

        public bool RecordingEnabled { get; set; }

        [MaxLength(500)]
        public string? RecordingUrl { get; set; }

        [MaxLength(500)]
        public string? RecordingPath { get; set; }

        public string? RecordingName { get; set; }

        public DateTime? RecordingUploadedAt { get; set; }

        // ============================
        // Learning Material
        // ============================

        [MaxLength(500)]
        public string? ModulePdfPath { get; set; }

        public string? ModulePdfName { get; set; }

        // ============================
        // Class Status
        // ============================

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Scheduled";
        // Scheduled | Live | Completed | Cancelled

        // ============================
        // Audit
        // ============================

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // ============================
        // Navigation Properties
        // ============================

        public Course Course { get; set; } = null!;

        public Batch Batch { get; set; } = null!;

        public Mentor Mentor { get; set; } = null!;

        public bool ReminderSent { get; set; } = false;

        [Required]
        public int ModuleId { get; set; }
        public ICollection<Attendance> Attendances { get; set; }
            = new List<Attendance>();
    }
}