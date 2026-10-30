namespace TalentSphereAPI.DTOs.Team

{

    public class TeamResponseDto

    {

        public int TeamId { get; set; }

        public string Name { get; set; } = string.Empty;

        public int DepartmentId { get; set; }

        public int? ManagerId { get; set; }

        public string? ManagerName { get; set; }

    }

}
