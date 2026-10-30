namespace TalentSphereAPI.DTOs.Department

{

    public class DepartmentResponseDto

    {

        public int DepartmentId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public int? ManagerId { get; set; }

        public string? ManagerName { get; set; }

    }

}
