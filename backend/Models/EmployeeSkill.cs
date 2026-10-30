namespace TalentSphereAPI.Models
{
    public class EmployeeSkill
    {
        public int EmployeeSkillId { get; set; }

        public int EmployeeId { get; set; }

        public int SkillId { get; set; }

        public string Level { get; set; } = string.Empty;

        public bool Verified { get; set; }
    }
}