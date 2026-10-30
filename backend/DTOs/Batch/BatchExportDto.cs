namespace TalentSphereAPI.DTOs.Batch
{
    public class BatchExportDto
    {
        public string BatchCode { get; set; }
            = string.Empty;

        public string BatchName { get; set; }
            = string.Empty;

        public string Course { get; set; }
            = string.Empty;

        public string Mentor { get; set; }
            = string.Empty;

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public string Status { get; set; }
            = string.Empty;

        public int Capacity { get; set; }

        public int EnrolledStudents { get; set; }

        public int AvailableSeats { get; set; }

        public DateTime CreatedDate { get; set; }
    }
}