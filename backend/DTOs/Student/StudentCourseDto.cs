namespace TalentSphereAPI.DTOs.Student
{
    public class StudentCourseDto
    {
        public int CourseId { get; set; }

        public string CourseName { get; set; } = string.Empty;

        public string Duration { get; set; } = string.Empty;

        public string Level { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public string? PdfUrl { get; set; }

        public bool CourseStatus { get; set; }

        // ==========================
        // Batch
        // ==========================

        public int BatchId { get; set; }

        public string BatchName { get; set; } = string.Empty;

        public string BatchType { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public string BatchStatus { get; set; } = string.Empty;

        // ==========================
        // Mentor
        // ==========================

        public int? MentorId { get; set; }

        public string MentorName { get; set; } = string.Empty;

        public string? MentorProfilePhotoUrl { get; set; }

        // ==========================
        // Student Enrollment
        // ==========================

        public string StudentStatus { get; set; } = string.Empty;

        public bool IsActive { get; set; }
    }
}