namespace TalentSphereAPI.DTOs.Batch
{
    public class MentorBatchesResponseDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;

        public string? ProfilePhotoUrl { get; set; }
        public int TotalRecords { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }

        public List<MentorBatchDto> Batches { get; set; }
            = new List<MentorBatchDto>();
    }
}