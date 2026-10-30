namespace TalentSphereAPI.DTOs.Team

{

    public class CreateTeamDto

    {

        public string Name { get; set; } = string.Empty;

        public int DepartmentId { get; set; }

        public int? ManagerId { get; set; }

    }

}
