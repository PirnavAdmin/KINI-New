namespace TalentSphereAPI.DTOs.Branches
{
    public class CreateBranchDto
    {
        public int OrganizationId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Location { get; set; }

        public string? Description { get; set; }
    }
}