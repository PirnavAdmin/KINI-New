namespace TalentSphereAPI.DTOs.Student

{

    public class StudentDto

    {

        public int StudentId { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;

        public int BatchId { get; set; }
        public string BatchName { get; set; } = string.Empty;

        public int? MentorId { get; set; }
        public string MentorName { get; set; } = string.Empty;

        public string CourseDates { get; set; } = string.Empty;

        public decimal Attendance { get; set; }

        public int AssessmentsCleared { get; set; }

        public string Status { get; set; } = string.Empty;

        public string? ProfilePhotoUrl { get; set; }
    }
}

    


