namespace TalentSphereAPI.Models

{

    public class Role

    {

        public int RoleId { get; set; }

        public string RoleName { get; set; } = string.Empty;

        public string? Description { get; set; }

        public ICollection<RoleCompetency>? RoleCompetencies { get; set; }

    }

}
