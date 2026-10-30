namespace TalentSphereAPI.DTOs.Mentor
{
    public class MentorListDto
    {
        public int MentorId { get; set; }

        public string MentorName { get; set; } = string.Empty;

        public string? ProfilePhotoUrl { get; set; }

        public string Courses { get; set; } = string.Empty;

        public string Batches { get; set; } = string.Empty;

        public int LiveClasses { get; set; }

        public int RecordedClasses { get; set; }

        public decimal Attendance { get; set; }

        public bool Status { get; set; }
    }
}