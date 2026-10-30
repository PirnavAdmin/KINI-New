namespace TalentSphereAPI.DTOs.Course
{
    public class PublicCourseDto
    {
        public int CourseId { get; set; }

        public string CourseName { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string Duration { get; set; } = string.Empty;

        public string Level { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public string? PdfUrl { get; set; }

        public bool Status { get; set; }

        public int OrganizationId { get; set; }

        public string OrganizationName { get; set; } = string.Empty;

        public List<int> BatchIds { get; set; } = new();

        public List<string> BatchNames { get; set; } = new();

        public int TotalPurchases { get; set; }

        public int TotalAssessments { get; set; }
    }
}