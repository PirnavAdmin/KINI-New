using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TalentSphereAPI.Models
{
    public class Course
    {
        [Key]
        public int CourseId { get; set; }

        // ==========================================
        // TENANT / ORGANIZATION
        // ==========================================

        public int OrganizationId { get; set; }

        public Organization Organization { get; set; } = null!;

        // ==========================================
        // COURSE INFORMATION
        // ==========================================

        [Required]
        [MaxLength(200)]
        public string CourseName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string CourseCode { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(50)]
        public string Duration { get; set; } = string.Empty;

        // ==========================================
        // BATCHES
        // ==========================================

        public ICollection<Batch> Batches { get; set; }
            = new List<Batch>();

        // ==========================================
        // LEVEL
        // ==========================================

        [Required]
        [MaxLength(50)]
        public string Level { get; set; } = string.Empty;

        // ==========================================
        // PRICE
        // ==========================================

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        // ==========================================
        // PDF
        // ==========================================

        [MaxLength(500)]
        public string? PdfUrl { get; set; }

        // ==========================================
        // STATUS
        // ==========================================

        public bool Status { get; set; } = true;

        // ==========================================
        // ASSESSMENTS
        // ==========================================

        public ICollection<Assessment> Assessments { get; set; }
            = new List<Assessment>();
        // ==========================================
        // SYLLABUS
        // ==========================================

        public ICollection<CourseModule> Modules { get; set; }
            = new List<CourseModule>();

        // Public catalogue visibility
        // Existing courses remain private until explicitly approved.
        public bool IsPublic { get; set; } = false;

        // Archived courses must never appear in the public catalogue.
        public bool IsArchived { get; set; } = false;
    }
}