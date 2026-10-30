namespace TalentSphereAPI.DTOs.Student
{
    public class EnrollStudentsToBatchDto
    {
        public int BatchId { get; set; }

        public List<int> StudentIds { get; set; } = new List<int>();
    }

    public class EnrollStudentsResponseDto
    {
        public string Message { get; set; } = string.Empty;

        public int BatchId { get; set; }

        public int EnrolledStudents { get; set; }

        public int Capacity { get; set; }

        public int AvailableSeats { get; set; }

        public List<int> EnrolledStudentIds { get; set; }
            = new List<int>();
    }
}