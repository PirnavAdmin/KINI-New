namespace TalentSphereAPI.DTOs.Department

{

    public class UpdateDepartmentDto

    {

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public int? ManagerId { get; set; }

    }

}
