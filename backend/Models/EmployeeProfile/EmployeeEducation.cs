using TalentSphereAPI.Models;

namespace TalentSphereAPI.Models.EmployeeProfile;

public class EmployeeEducation : BaseEntity
{
    public int EmployeeEducationId { get; set; }
    public int OrganizationId { get; set; }
    public int EmployeeProfileId { get; set; }
    public string Qualification { get; set; } = string.Empty;
    public string University { get; set; } = string.Empty;
    public int? Year { get; set; }
    public decimal? Percentage { get; set; }
    public string? Specialization { get; set; }

    public EmployeeProfile EmployeeProfile { get; set; } = null!;
}
