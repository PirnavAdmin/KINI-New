using TalentSphereAPI.Models;

public class Mentor : BaseEntity
{
    public int MentorId { get; set; }

    // ==========================================
    // Organization / Tenant
    // ==========================================

    public int OrganizationId { get; set; }

    public Organization Organization { get; set; } = null!;

    // ==========================================
    // Employee Relationship
    // ==========================================

    public int EmployeeId { get; set; }

    // ==========================================
    // Mentor Information
    // ==========================================

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public bool Status { get; set; }

    public DateTime CreatedDate { get; set; }

    // ==========================================
    // Navigation Properties
    // ==========================================

    public ICollection<Course> Courses { get; set; }
        = new List<Course>();

    public ICollection<Batch> Batches { get; set; }
        = new List<Batch>();

    public ICollection<Notification> Notifications { get; set; }
        = new List<Notification>();

    public ICollection<Notification> CreatedNotifications { get; set; }
        = new List<Notification>();
}