namespace TalentSphereAPI.Models

{

    public class Team

    {

        public int TeamId { get; set; }

        public string Name { get; set; } = string.Empty;

        public int DepartmentId { get; set; }

        public int? ManagerId { get; set; }

        // Navigation

        public Department? Department { get; set; }

        public Employee? Manager { get; set; }

    }

}
