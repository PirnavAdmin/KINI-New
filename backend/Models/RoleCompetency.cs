using System.Data;

namespace TalentSphereAPI.Models

{

    public class RoleCompetency

    {

        public int RoleCompetencyId { get; set; }

        public int RoleId { get; set; }

        public int CompetencyId { get; set; }

        public int RequiredLevel { get; set; }

        public Role? Role { get; set; }

        public Competency? Competency { get; set; }

    }

}
