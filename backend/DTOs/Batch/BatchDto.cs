using TalentSphereAPI.Models;

namespace TalentSphereAPI.DTOs.Batch
{
    public class BatchDto
    {
        public int BatchId { get; set; }

        public string BatchName { get; set; } = string.Empty;

        public int CourseId { get; set; }

        public string CourseName { get; set; } = string.Empty;

        public int MentorId { get; set; }

        public string MentorName { get; set; } = string.Empty;

        public string? MentorProfilePhotoUrl { get; set; }

        public BatchType BatchType { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public int Capacity { get; set; }

        public int EnrolledStudents { get; set; }

        public int LiveClasses { get; set; }

        public int RecordedClasses { get; set; }

        public string? Description { get; set; }

        public BatchStatus Status { get; set; }
    }
}