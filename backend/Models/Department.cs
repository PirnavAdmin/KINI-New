namespace TalentSphereAPI.Models

{

    public class Department

    {

        public int DepartmentId { get; set; }

        public int OrganizationId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public int? ManagerId { get; set; }

        public Employee? Manager { get; set; }



        // Navigation Properties

        public Organization? Organization { get; set; }

      

        public ICollection<Team>? Teams { get; set; }

        public ICollection<Employee>? Employees { get; set; }

    }

}
