using TalentSphereAPI.Models;

namespace TalentSphereAPI.Models.EmployeeProfile;

public class EmployeeWorkExperience : BaseEntity
{
    public int EmployeeWorkExperienceId { get; set; }
    public int OrganizationId { get; set; }
    public int EmployeeProfileId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public decimal? YearsOfExperience { get; set; }
    public string? ReasonForLeaving { get; set; }
    public string? Description { get; set; }

    public EmployeeProfile EmployeeProfile { get; set; } = null!;
}
