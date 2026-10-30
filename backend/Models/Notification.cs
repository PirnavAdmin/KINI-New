using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TalentSphereAPI.Enums;

namespace TalentSphereAPI.Models
{
    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }

        // =========================================================
        // STUDENT RECIPIENT
        // =========================================================

        public int? StudentId { get; set; }

        public Student? Student { get; set; }

        // =========================================================
        // MENTOR RECIPIENT
        // =========================================================

        public int? MentorId { get; set; }

        public Mentor? Mentor { get; set; }

        // =========================================================
        // ORGANIZATION ADMIN RECIPIENT
        // =========================================================

        public int? OrganizationId { get; set; }

        public Organization? Organization { get; set; }

        // =========================================================
        // NOTIFICATION DETAILS
        // =========================================================

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        [Required]
        public NotificationType NotificationType { get; set; }

        // Related entity ID
        public int ReferenceId { get; set; }

        [Required]
        public ReferenceType ReferenceType { get; set; }

        // =========================================================
        // READ STATUS
        // =========================================================

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReadAt { get; set; }

        // =========================================================
        // CREATED BY MENTOR
        // =========================================================
        // Nullable because Organization/System notifications
        // may not be created by a Mentor.

        public int? CreatedByMentorId { get; set; }

        [ForeignKey(nameof(CreatedByMentorId))]
        public Mentor? CreatedByMentor { get; set; }

        // EMPLOYEE RECIPIENT
        public int? EmployeeId { get; set; }

        public Employee? Employee { get; set; }
    }
}