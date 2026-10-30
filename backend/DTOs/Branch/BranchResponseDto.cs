namespace TalentSphereAPI.DTOs.Branches

{

    public class BranchResponseDto

    {

        public int BranchId { get; set; }

        public int OrganizationId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public string Country { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

    }

}
