namespace TalentSphereAPI.DTOs.RecycleBin
{
    public class DeletedRecordDto
    {
        public int Id { get; set; }

        public string ModuleName { get; set; } = string.Empty;

        public int RecordId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Email { get; set; }
        public DateTime? DeletedOn { get; set; }

        public string? DeletedBy { get; set; }
    }
}