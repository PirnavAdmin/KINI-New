namespace TalentSphereAPI.DTOs;

public class MeetingParticipantDto
{
    public string ParticipantId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public DateTime JoinTime { get; set; }

    public DateTime? LeaveTime { get; set; }

    public int DurationMinutes { get; set; }
}