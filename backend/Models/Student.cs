using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public class Student : BaseEntity
    {
        public int StudentId { get; set; }

        // ==========================================
        // Organization / Tenant
        // ==========================================

        public int OrganizationId { get; set; }

        public Organization Organization { get; set; } = null!;

        // ==========================================
        // Student Information
        // ==========================================

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        // ==========================================
        // Course
        // ==========================================

        public int CourseId { get; set; }

        public Course Course { get; set; } = null!;

        // ==========================================
        // Batch
        // ==========================================

        public int BatchId { get; set; }

        public Batch Batch { get; set; } = null!;

        // ==========================================
        // Mentor
        // ==========================================

        public int? MentorId { get; set; }

        public Mentor? Mentor { get; set; }

        // ==========================================
        // Student Details
        // ==========================================

        public string? CourseDates { get; set; }

        public decimal Attendance { get; set; }

        public int AssessmentsCleared { get; set; }

        public string Status { get; set; } = "Active";

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string? GoogleSubjectId { get; set; }

        public string? ProfilePhotoUrl { get; set; }
        public ICollection<Notification> Notifications { get; set; }
            = new List<Notification>();
    }
}