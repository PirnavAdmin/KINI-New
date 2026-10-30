namespace TalentSphereAPI.DTOs.Course
{
    public class CreateCourseDto
    {
        public string CourseName { get; set; } = string.Empty;

        public string Duration { get; set; } = string.Empty;

        public string Level { get; set; } = string.Empty;

        public decimal Price { get; set; }
    }
}