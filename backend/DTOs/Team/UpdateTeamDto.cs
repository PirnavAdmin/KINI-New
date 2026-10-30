namespace TalentSphereAPI.DTOs.Team

{

    public class UpdateTeamDto

    {

        public string Name { get; set; } = string.Empty;

        public int DepartmentId { get; set; }

        public int? ManagerId { get; set; }

    }

}
