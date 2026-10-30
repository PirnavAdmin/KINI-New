using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public class StudentEnrollment
    {
        [Key]
        public int EnrollmentId { get; set; }

        public int OrganizationId { get; set; }
        public Organization Organization { get; set; } = null!;

        public int StudentId { get; set; }
        public Student Student { get; set; } = null!;

        public int CourseId { get; set; }
        public Course Course { get; set; } = null!;

        public int BatchId { get; set; }
        public Batch Batch { get; set; } = null!;

        public bool IsActive { get; set; } = true;

        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;

        public DateTime? EndedAt { get; set; }

        // MySQL computed column: active enrollments expose CourseId.
        // Inactive enrollments expose NULL, allowing enrollment history.
        public int? ActiveCourseId { get; private set; }
    }
}