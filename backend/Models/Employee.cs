using TalentSphereAPI.Models;

public class Employee : BaseEntity
{
    public int EmployeeId { get; set; }

    public int OrganizationId { get; set; }

    // Link Employee to the login/permission User
    public int? UserId { get; set; }

    public User? User { get; set; }

    public Organization Organization { get; set; } = null!;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string EmployeeType { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string? ProfilePhotoUrl { get; set; }
    public ICollection<EmployeePermission> EmployeePermissions { get; set; }
    = new List<EmployeePermission>();
    public string? GoogleSubjectId { get; set; }
}