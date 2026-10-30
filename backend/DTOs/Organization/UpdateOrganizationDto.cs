namespace TalentSphereAPI.DTOs.Organization

{

    public class UpdateOrganizationDto

    {

        public string OrganizationName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Industry { get; set; } = string.Empty;

        public string Country { get; set; } = string.Empty;

        public string Website { get; set; } = string.Empty;

    }

}
