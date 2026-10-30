namespace TalentSphereAPI.DTOs.Course
{
    public class CourseDto
    {
        public int CourseId { get; set; }

        public string CourseName { get; set; }
            = string.Empty;

        public string Duration { get; set; }
            = string.Empty;

        public List<int> BatchIds { get; set; }
            = new();

        public List<string> BatchNames { get; set; }
            = new();

        public string Level { get; set; }
            = string.Empty;

        public decimal Price { get; set; }

        public string? PdfUrl { get; set; }

        public int TotalPurchases { get; set; }

        public int TotalAssessments { get; set; }

        public bool Status { get; set; }
    }
}