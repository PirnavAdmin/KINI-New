using System.ComponentModel.DataAnnotations;
using TalentSphereAPI.Models;

public class MeetingEvent
{
    [Key]
    public int MeetingEventId { get; set; }

    public int LiveClassId { get; set; }

    public int? StudentId { get; set; }

    // Zoom's unique webhook event ID.
    public string? EventId { get; set; }

    public string MeetingId { get; set; } = string.Empty;

    public string ParticipantId { get; set; } = string.Empty;

    public string ParticipantEmail { get; set; } = string.Empty;

    public string ParticipantName { get; set; } = string.Empty;

    public MeetingEventType EventType { get; set; }

    public DateTime EventTime { get; set; }

    public bool IsProcessed { get; set; }
}