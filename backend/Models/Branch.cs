using TalentSphereAPI.Models;

public class Branch
{
    public int BranchId { get; set; }

    public int OrganizationId { get; set; }

    public Organization Organization { get; set; } = null!;

    public string BranchName { get; set; } = string.Empty;

    public string? Location { get; set; }

    public string? Description { get; set; }

    public bool Status { get; set; } = true;

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public ICollection<Department> Departments { get; set; }
        = new List<Department>();
}