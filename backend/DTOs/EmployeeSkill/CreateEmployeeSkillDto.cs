using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.DTOs.EmployeeSkill
{
    public class CreateEmployeeSkillDto
    {
        [Required]
        public int EmployeeId { get; set; }

        [Required]
        public int SkillId { get; set; }

        [Required]
        public string Level { get; set; } = string.Empty;

        public bool Verified { get; set; }
    }
}