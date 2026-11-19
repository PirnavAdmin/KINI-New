namespace TalentSphereAPI.DTOs.Course
{
    public class CreateCourseDto
    {
        public string CourseName { get; set; } = string.Empty;

        public string Duration { get; set; } = string.Empty;

        public string Level { get; set; } = string.Empty;

        public decimal Price { get; set; }

        // Active (true, default) or Draft (false), as chosen in the course form.
        public bool? Status { get; set; }
    }
}