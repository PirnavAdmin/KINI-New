namespace TalentSphereAPI.DTOs.Course
{
    public class CourseFilterDto
    {
        public string? Search { get; set; }

        public bool? Status { get; set; }

        public int? MentorId { get; set; }

    

        public string? Level { get; set; }

        public string SortBy { get; set; } = "CourseName";

        public string SortOrder { get; set; } = "asc";

        public int Page { get; set; } = 1;

        public int PageSize { get; set; } = 10;
    }
}