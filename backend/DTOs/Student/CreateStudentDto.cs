namespace TalentSphereAPI.DTOs.Student
{
    public class CreateStudentDto
    {
        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public int CourseId { get; set; }

        public int BatchId { get; set; }
    }
}