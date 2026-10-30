using TalentSphereAPI.Models;

public class CreateBatchDto
{
    public string BatchName { get; set; } = string.Empty;

    public int CourseId { get; set; }

    public int MentorId { get; set; }

    public BatchType BatchType { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public int Capacity { get; set; }

    public string? Description { get; set; }

    public BatchStatus Status { get; set; }
}