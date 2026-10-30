using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models;

public class HrCalendarEvent : BaseEntity
{
    [Key]
    public int EventId { get; set; }

    public int OrganizationId { get; set; }

    [Required]
    [MaxLength(20)]
    public string EventType { get; set; } = "OTHER";

    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string? Description { get; set; }

    public DateTime StartDateTime { get; set; }

    public DateTime EndDateTime { get; set; }

    [MaxLength(255)]
    public string? Location { get; set; }

    [MaxLength(2000)]
    public string? MeetingLink { get; set; }

    public bool AllDay { get; set; }

    [MaxLength(100)]
    public string? Color { get; set; }

    public int? CourseId { get; set; }

    public int? BatchId { get; set; }

    public int? EmployeeId { get; set; }

    public int? StudentId { get; set; }

    [MaxLength(255)]
    public string? CreatedBy { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedDate { get; set; }

    public Organization Organization { get; set; } = null!;

    public Course? Course { get; set; }

    public Batch? Batch { get; set; }

    public Employee? Employee { get; set; }

    public Student? Student { get; set; }
}