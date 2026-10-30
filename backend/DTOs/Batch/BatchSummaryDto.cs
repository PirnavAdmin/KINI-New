namespace TalentSphereAPI.DTOs.Batch
{
    public class BatchSummaryDto
    {
        public int TotalBatches { get; set; }
        public int ActiveBatches { get; set; }
        public int UpcomingBatches { get; set; }
        public int CompletedBatches { get; set; }
        public int CancelledBatches { get; set; }
        public int EnrolledStudents { get; set; }
    }
}