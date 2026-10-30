public class CreateLiveClassDto
{
    public string ClassTitle { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int CourseId { get; set; }

    public int BatchId { get; set; }

    public DateTime ScheduledDate { get; set; }

    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }

    public string MeetingPlatform { get; set; } = string.Empty;

    public string? MeetingLink { get; set; }

    public string? MeetingPassword { get; set; }

    public bool RecordingEnabled { get; set; }

    [System.ComponentModel.DataAnnotations.Range(1, int.MaxValue)]
    public int ModuleId { get; set; }
}