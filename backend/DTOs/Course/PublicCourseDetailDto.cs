namespace TalentSphereAPI.DTOs.Course
{
    /// <summary>Single public course for the enrollment page (no private org data).</summary>
    public class PublicCourseDetailDto
    {
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Duration { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public decimal Price { get; set; }

        // Public poster image URL path (null = no poster).
        public string? PosterUrl { get; set; }
        public string Currency { get; set; } = "INR";
        public int OrganizationId { get; set; }
        public string OrganizationName { get; set; } = string.Empty;
        public int TotalAssessments { get; set; }
        public List<PublicBatchOptionDto> OpenBatches { get; set; } = new();
    }

    public class PublicBatchOptionDto
    {
        public int BatchId { get; set; }
        public string BatchName { get; set; } = string.Empty;
        public string BatchType { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int SeatsAvailable { get; set; }
    }
}
