namespace TalentSphereAPI.DTOs.Batch
{
    public class MentorBatchDto
    {
        public int BatchId { get; set; }
        public string BatchName { get; set; } = string.Empty;

        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public int StudentCount { get; set; }
        public int Capacity { get; set; }
    }
}