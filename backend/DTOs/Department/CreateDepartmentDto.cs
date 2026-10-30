namespace TalentSphereAPI.DTOs.Department

{

    public class CreateDepartmentDto

    {

        public int OrganizationId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public int? ManagerId { get; set; }

    }

}
