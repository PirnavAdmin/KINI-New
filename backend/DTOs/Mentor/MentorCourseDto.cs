namespace TalentSphereAPI.DTOs.Mentor
{
    public class MentorCourseDto
    {
        public int CourseId { get; set; }

        public string CourseName { get; set; }
            = string.Empty;

        public string Duration { get; set; }
            = string.Empty;

        public string Level { get; set; }
            = string.Empty;

        public decimal Price { get; set; }

        public bool Status { get; set; }
    }
}