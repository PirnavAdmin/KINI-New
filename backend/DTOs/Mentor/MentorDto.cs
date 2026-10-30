namespace TalentSphereAPI.DTOs.Mentor
{
    public class MentorDto
    {
        public int MentorId { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public List<int> CourseIds { get; set; } = new();

        public List<int> BatchIds { get; set; } = new();

        public bool Status { get; set; }
    }
}