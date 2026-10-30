namespace TalentSphereAPI.DTOs.Student
{
    public class StudentCoursesResponseDto
    {
        public bool Success { get; set; }

        public string Message { get; set; } = string.Empty;

        public int StudentId { get; set; }

        public string StudentName { get; set; } = string.Empty;

        public string? ProfilePhotoUrl { get; set; }

        public string Email { get; set; } = string.Empty;

        public List<StudentCourseDto> Courses { get; set; }
            = new();
    }
}