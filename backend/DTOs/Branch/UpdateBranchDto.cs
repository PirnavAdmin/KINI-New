namespace TalentSphereAPI.DTOs.Branches
{
    public class UpdateBranchDto
    {
        public string Name { get; set; } = string.Empty;

        public string? Location { get; set; }

        public string? Description { get; set; }
    }
}