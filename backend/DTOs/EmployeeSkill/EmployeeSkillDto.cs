namespace TalentSphereAPI.DTOs.EmployeeSkill
{
    public class EmployeeSkillDto
    {
      
        
            public int Id { get; set; }

            public int EmployeeId { get; set; }

            public string EmployeeName { get; set; } = string.Empty;

            public int SkillId { get; set; }

            public string SkillName { get; set; } = string.Empty;

            public string Level { get; set; } = string.Empty;

            public bool Verified { get; set; }
        }
    }

