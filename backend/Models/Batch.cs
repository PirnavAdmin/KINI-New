using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public enum BatchType
    {
        Online,
        Offline,
        Hybrid
    }

    public enum BatchStatus
    {
        Upcoming,
        Active,
        Completed,
        Cancelled
    }

    public class Batch
    {
        [Key]
        public int BatchId { get; set; }

        // ==========================================
        // Organization / Tenant
        // ==========================================

        public int OrganizationId { get; set; }

        public Organization Organization { get; set; } = null!;

        // ==========================================
        // Batch Information
        // ==========================================

        [Required]
        [MaxLength(150)]
        public string BatchName { get; set; } = string.Empty;

        [Required]
        public int MentorId { get; set; }

        public Mentor Mentor { get; set; } = null!;

        public int CourseId { get; set; }

        public Course Course { get; set; } = null!;

        [Required]
        public BatchType BatchType { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Range(1, int.MaxValue)]
        public int Capacity { get; set; }

        public int EnrolledStudents { get; set; }

        public int LiveClasses { get; set; }

        public int RecordedClasses { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public BatchStatus Status { get; set; }
            = BatchStatus.Upcoming;

        public DateTime CreatedDate { get; set; }
            = DateTime.UtcNow;

        public DateTime? ModifiedDate { get; set; }

        // ==========================================
        // Navigation
        // ==========================================

        public ICollection<Student> Students { get; set; }
            = new List<Student>();

        public ICollection<Assessment> Assessments { get; set; }
            = new List<Assessment>();
    }
}