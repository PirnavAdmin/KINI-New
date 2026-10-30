using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models;

public class EmployeePerformance : BaseEntity
{
    [Key]
    public int PerformanceId { get; set; }

    public int OrganizationId { get; set; }

    public int EmployeeId { get; set; }

    /// <summary>
    /// Review period in YYYY-MM format.
    /// Example: 2026-09
    /// </summary>
    [Required]
    [MaxLength(7)]
    public string Period { get; set; } = string.Empty;

    /// <summary>
    /// Overall performance score from 0 to 100.
    /// </summary>
    public decimal PerformanceScore { get; set; }

    /// <summary>
    /// Target completion percentage from 0 to 100.
    /// </summary>
    public decimal TargetCompletion { get; set; }

    /// <summary>
    /// Attendance percentage associated with the review period.
    /// </summary>
    public decimal Attendance { get; set; }

    /// <summary>
    /// Optional HR/evaluator notes.
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Optional evaluator employee/user identifier.
    /// Kept nullable because the current API specification
    /// does not require evaluator information in the create body.
    /// </summary>
  

    public Employee Employee { get; set; } = null!;

    public Organization Organization { get; set; } = null!;
}