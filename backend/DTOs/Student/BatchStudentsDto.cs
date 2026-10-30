namespace TalentSphereAPI.DTOs.Student
{
    public class BatchStudentsDto
    {
        public int BatchId { get; set; }

        public string BatchName { get; set; } = string.Empty;

        public string CourseName { get; set; } = string.Empty;

        public int Capacity { get; set; }

        public int EnrolledStudents { get; set; }

        public int AvailableSeats { get; set; }

        public List<BatchStudentDto> Students { get; set; }
            = new List<BatchStudentDto>();
    }

    public class BatchStudentDto
    {
        public int StudentId { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public int CourseId { get; set; }

        public int BatchId { get; set; }

        public int? MentorId { get; set; }

        public string? CourseDates { get; set; }

        public decimal Attendance { get; set; }

        public int AssessmentsCleared { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}