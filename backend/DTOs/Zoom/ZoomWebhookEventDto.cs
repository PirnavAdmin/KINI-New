using System.Text.Json.Serialization;

namespace TalentSphereAPI.DTOs.Zoom;

public sealed class ZoomWebhookEventDto
{
    [JsonPropertyName("event")]
    public string? Event { get; set; }

    [JsonPropertyName("event_ts")]
    public long EventTs { get; set; }

    [JsonPropertyName("event_id")]
    public string? EventId { get; set; }

    [JsonPropertyName("payload")]
    public ZoomWebhookPayloadDto? Payload { get; set; }
}

public sealed class ZoomWebhookPayloadDto
{
    [JsonPropertyName("account_id")]
    public string? AccountId { get; set; }

    [JsonPropertyName("object")]
    public ZoomWebhookMeetingDto? Object { get; set; }

    [JsonPropertyName("plainToken")]
    public string? PlainToken { get; set; }
}

public sealed class ZoomWebhookMeetingDto
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("uuid")]
    public string? Uuid { get; set; }

    [JsonPropertyName("participant")]
    public ZoomWebhookParticipantDto? Participant { get; set; }
}

public sealed class ZoomWebhookParticipantDto
{
    [JsonPropertyName("user_id")]
    public string? UserId { get; set; }

    [JsonPropertyName("participant_user_id")]
    public string? ParticipantUserId { get; set; }

    [JsonPropertyName("participant_uuid")]
    public string? ParticipantUuid { get; set; }

    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("user_name")]
    public string? UserName { get; set; }

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("join_time")]
    public DateTime? JoinTime { get; set; }

    [JsonPropertyName("leave_time")]
    public DateTime? LeaveTime { get; set; }
}