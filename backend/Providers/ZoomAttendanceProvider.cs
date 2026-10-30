using Microsoft.AspNetCore.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using TalentSphereAPI.DTOs;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Providers
{
    public class ZoomAttendanceProvider
    : BaseMeetingAttendanceProvider
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public override string ProviderName => "Zoom";

        public ZoomAttendanceProvider(
            HttpClient httpClient,
            IConfiguration configuration,
            IAttendanceProcessor attendanceProcessor)
            : base(attendanceProcessor)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public override async Task<CreateMeetingResponseDto> CreateMeetingAsync(
     LiveClass liveClass)
        {
            var accessToken = await GetAccessTokenAsync();

            var durationMinutes =
                (int)(liveClass.EndTime - liveClass.StartTime).TotalMinutes;

            if (durationMinutes <= 0)
            {
                throw new Exception(
                    "Meeting duration must be greater than zero.");
            }

            var localStartDateTime =
                liveClass.ScheduledDate.Date
                    .Add(liveClass.StartTime);

            var requestBody = new
            {
                topic = liveClass.ClassTitle,

                type = 2,

                start_time = localStartDateTime
                    .ToString("yyyy-MM-dd'T'HH:mm:ss"),

                duration = durationMinutes,

                timezone = "Asia/Kolkata",

                settings = new
                {
                    host_video = true,

                    participant_video = true,

                    join_before_host = false,

                    waiting_room = true,

                    mute_upon_entry = true,

                    auto_recording = "none"
                }
            };

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                "https://api.zoom.us/v2/users/me/meetings");

            request.Headers.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    accessToken);

            request.Content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");

            using var response =
                await _httpClient.SendAsync(request);

            var responseBody =
                await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception(
                    $"Zoom meeting creation failed. " +
                    $"HTTP {(int)response.StatusCode} " +
                    $"{response.ReasonPhrase}. " +
                    $"Response: {responseBody}");
            }

            using var document =
                JsonDocument.Parse(responseBody);

            var root = document.RootElement;

            if (!root.TryGetProperty("id", out var idElement))
            {
                throw new Exception(
                    "Zoom response did not contain a meeting ID.");
            }

            if (!root.TryGetProperty(
                    "join_url",
                    out var joinUrlElement))
            {
                throw new Exception(
                    "Zoom response did not contain a join URL.");
            }

            var meetingId =
                idElement.ToString();

            var joinUrl =
                joinUrlElement.GetString() ?? string.Empty;

            var hostUrl =
                root.TryGetProperty(
                    "start_url",
                    out var startUrlElement)
                    ? startUrlElement.GetString() ?? string.Empty
                    : string.Empty;

            var password =
                root.TryGetProperty(
                    "password",
                    out var passwordElement)
                    ? passwordElement.GetString() ?? string.Empty
                    : string.Empty;

            if (string.IsNullOrWhiteSpace(meetingId))
            {
                throw new Exception(
                    "Zoom returned an empty meeting ID.");
            }

            if (string.IsNullOrWhiteSpace(joinUrl))
            {
                throw new Exception(
                    "Zoom returned an empty join URL.");
            }

            return new CreateMeetingResponseDto
            {
                MeetingId = meetingId,

                JoinUrl = joinUrl,

                HostUrl = hostUrl,

                MeetingPassword = password,

                Provider = ProviderName,

                StartTime = localStartDateTime,

                EndTime = localStartDateTime
                    .AddMinutes(durationMinutes)
            };
        }
        private async Task<string> GetAccessTokenAsync()
        {
            var accountId =
                _configuration["Zoom:AccountId"];

            var clientId =
                _configuration["Zoom:ClientId"];

            var clientSecret =
                _configuration["Zoom:ClientSecret"];

            Console.WriteLine(
                $"[ZOOM] AccountId configured: {!string.IsNullOrWhiteSpace(accountId)}");

            Console.WriteLine(
                $"[ZOOM] AccountId length: {accountId?.Length ?? 0}");

            Console.WriteLine(
                $"[ZOOM] ClientId configured: {!string.IsNullOrWhiteSpace(clientId)}");

            Console.WriteLine(
                $"[ZOOM] ClientSecret configured: {!string.IsNullOrWhiteSpace(clientSecret)}");

            Console.WriteLine(
                $"[ZOOM] ClientSecret length: {clientSecret?.Length ?? 0}");

            if (string.IsNullOrWhiteSpace(accountId) ||
                string.IsNullOrWhiteSpace(clientId) ||
                string.IsNullOrWhiteSpace(clientSecret))
            {
                throw new Exception(
                    "Zoom configuration is missing AccountId, ClientId, or ClientSecret.");
            }

            var credentials =
                Convert.ToBase64String(
                    Encoding.UTF8.GetBytes(
                        $"{clientId}:{clientSecret}"));

            using var request =
                new HttpRequestMessage(
                    HttpMethod.Post,
                    "https://zoom.us/oauth/token");

            request.Headers.Host = "zoom.us";

            request.Headers.Authorization =
                new AuthenticationHeaderValue(
                    "Basic",
                    credentials);

            request.Content =
                new FormUrlEncodedContent(
                    new Dictionary<string, string>
                    {
                        ["grant_type"] =
                            "account_credentials",

                        ["account_id"] =
                            accountId
                    });

            using var response =
                await _httpClient.SendAsync(request);

            var responseBody =
                await response.Content.ReadAsStringAsync();

            Console.WriteLine(
                $"[ZOOM] OAuth HTTP Status: {(int)response.StatusCode}");

            Console.WriteLine(
                $"[ZOOM] OAuth Response: {responseBody}");

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception(
                    $"Zoom OAuth failed. " +
                    $"HTTP {(int)response.StatusCode} " +
                    $"{response.ReasonPhrase}. " +
                    $"Response: {responseBody}");
            }

            using var document =
                JsonDocument.Parse(responseBody);

            if (!document.RootElement.TryGetProperty(
                    "access_token",
                    out var tokenElement))
            {
                throw new Exception(
                    "Zoom OAuth response did not contain access_token.");
            }

            return tokenElement.GetString()
                ?? throw new Exception(
                    "Zoom access token was empty.");
        }
        public override async Task<bool> TestConnectionAsync()
        {
            var token = await GetAccessTokenAsync();

            return !string.IsNullOrWhiteSpace(token);
        }
        public override async Task<bool> UpdateMeetingAsync(
     LiveClass liveClass)
        {
            if (string.IsNullOrWhiteSpace(
                liveClass.MeetingId))
            {
                return false;
            }

            var accessToken =
                await GetAccessTokenAsync();

            var localStartDateTime =
                liveClass.ScheduledDate.Date
                    .Add(liveClass.StartTime);

            var durationMinutes =
                (int)(liveClass.EndTime -
                      liveClass.StartTime)
                    .TotalMinutes;

            if (durationMinutes <= 0)
            {
                return false;
            }

            var request = new
            {
                topic = liveClass.ClassTitle,

                start_time =
                    localStartDateTime
                        .ToString("yyyy-MM-dd'T'HH:mm:ss"),

                duration = durationMinutes,

                timezone = "Asia/Kolkata"
            };

            using var requestMessage =
                new HttpRequestMessage(
                    HttpMethod.Patch,
                    $"https://api.zoom.us/v2/meetings/" +
                    $"{liveClass.MeetingId}");

            requestMessage.Headers.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    accessToken);

            requestMessage.Content =
                new StringContent(
                    JsonSerializer.Serialize(request),
                    Encoding.UTF8,
                    "application/json");

            using var response =
                await _httpClient.SendAsync(
                    requestMessage);

            if (!response.IsSuccessStatusCode)
            {
                var responseBody =
                    await response.Content
                        .ReadAsStringAsync();

                throw new Exception(
                    $"Zoom meeting update failed. " +
                    $"HTTP {(int)response.StatusCode}: " +
                    responseBody);
            }

            return true;
        }

        public override async Task<bool> DeleteMeetingAsync(
    LiveClass liveClass)
        {
            if (string.IsNullOrWhiteSpace(
                liveClass.MeetingId))
            {
                return false;
            }

            var accessToken =
                await GetAccessTokenAsync();

            using var request =
                new HttpRequestMessage(
                    HttpMethod.Delete,
                    $"https://api.zoom.us/v2/meetings/" +
                    $"{liveClass.MeetingId}");

            request.Headers.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    accessToken);

            using var response =
                await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var responseBody =
                    await response.Content
                        .ReadAsStringAsync();

                throw new Exception(
                    $"Zoom meeting deletion failed. " +
                    $"HTTP {(int)response.StatusCode}: " +
                    responseBody);
            }

            return true;
        }

        public override async Task SyncAttendanceAsync(
            LiveClass liveClass)
        {
            if (liveClass == null)
                throw new ArgumentNullException(nameof(liveClass));

            Exception? lastException = null;

            // Zoom may need a short amount of time after meeting.ended
            // before past_meetings/{meetingId}/participants is available.
            // Retry here instead of finalizing attendance with stale data.
            for (var attempt = 1; attempt <= 3; attempt++)
            {
                try
                {
                    Console.WriteLine(
                        $"[ZOOM ATTENDANCE] Sync attempt {attempt}/3. " +
                        $"LiveClassId={liveClass.LiveClassId}, MeetingId={liveClass.MeetingId}");

                    var participants =
                        await GetParticipantsAsync(liveClass);

                    Console.WriteLine(
                        $"[ZOOM ATTENDANCE] Sync retrieved {participants.Count} participants. " +
                        $"LiveClassId={liveClass.LiveClassId}");

                    if (participants.Count > 0)
                    {
                        await _attendanceProcessor
                            .SyncZoomParticipantsAsync(
                                liveClass,
                                participants);
                    }

                    // A successful 200 response with zero participants is
                    // valid: it means nobody attended. Attendance can now
                    // safely be finalized as Absent.
                    return;
                }
                catch (Exception ex)
                {
                    lastException = ex;

                    Console.WriteLine(
                        $"[ZOOM ATTENDANCE] Sync attempt {attempt}/3 failed. " +
                        $"LiveClassId={liveClass.LiveClassId}. {ex.Message}");

                    if (attempt < 3)
                    {
                        await Task.Delay(
                            TimeSpan.FromSeconds(attempt * 2));
                    }
                }
            }

            throw new Exception(
                $"Zoom attendance synchronization failed for LiveClass {liveClass.LiveClassId}.",
                lastException);
        }

        public override async Task<List<MeetingParticipantDto>>
    GetParticipantsAsync(LiveClass liveClass)
        {
            var participants =
                new List<MeetingParticipantDto>();

            if (liveClass == null)
                throw new ArgumentNullException(nameof(liveClass));

            if (string.IsNullOrWhiteSpace(liveClass.MeetingId))
            {
                throw new Exception(
                    $"LiveClass {liveClass.LiveClassId} has no Zoom MeetingId. " +
                    "Attendance cannot be synchronized safely.");
            }

            var accessToken =
                await GetAccessTokenAsync();

            if (string.IsNullOrWhiteSpace(accessToken))
            {
                throw new Exception(
                    "Zoom access token is empty.");
            }

            string? nextPageToken = null;

            do
            {
                var url =
                    $"https://api.zoom.us/v2/past_meetings/" +
                    $"{Uri.EscapeDataString(liveClass.MeetingId)}" +
                    $"/participants?page_size=300";

                if (!string.IsNullOrWhiteSpace(nextPageToken))
                {
                    url +=
                        $"&next_page_token=" +
                        Uri.EscapeDataString(nextPageToken);
                }

                using var request =
                    new HttpRequestMessage(
                        HttpMethod.Get,
                        url);

                request.Headers.Authorization =
                    new AuthenticationHeaderValue(
                        "Bearer",
                        accessToken);

                using var response =
                    await _httpClient.SendAsync(request);

                var responseBody =
                    await response.Content.ReadAsStringAsync();

                Console.WriteLine(
                    $"[ZOOM ATTENDANCE] " +
                    $"LiveClassId={liveClass.LiveClassId}, " +
                    $"MeetingId={liveClass.MeetingId}, " +
                    $"HTTP={(int)response.StatusCode}");

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine(
                        $"[ZOOM ATTENDANCE] Zoom participant API failed. " +
                        $"HTTP {(int)response.StatusCode} " +
                        $"{response.ReasonPhrase}");

                    Console.WriteLine(
                        $"[ZOOM ATTENDANCE] Response: {responseBody}");

                    throw new Exception(
                        $"Zoom participant retrieval failed. " +
                        $"HTTP {(int)response.StatusCode} " +
                        $"{response.ReasonPhrase}. " +
                        $"Response: {responseBody}");
                }

                if (string.IsNullOrWhiteSpace(responseBody))
                {
                    throw new Exception(
                        "Zoom participant API returned an empty response.");
                }

                using var document =
                    JsonDocument.Parse(responseBody);

                var root =
                    document.RootElement;

                if (root.TryGetProperty(
                        "participants",
                        out var participantArray)
                    &&
                    participantArray.ValueKind ==
                        JsonValueKind.Array)
                {
                    foreach (var item in
                             participantArray.EnumerateArray())
                    {
                        // =============================================
                        // Participant ID
                        // =============================================

                        var participantId =
                            item.TryGetProperty(
                                "id",
                                out var idElement)
                                ? idElement.ToString()
                                : string.Empty;

                        // =============================================
                        // Name
                        // =============================================

                        var name =
                            item.TryGetProperty(
                                "name",
                                out var nameElement)
                                ? nameElement.GetString()
                                    ?? string.Empty
                                : string.Empty;

                        // =============================================
                        // Email
                        // =============================================

                        var email =
                            item.TryGetProperty(
                                "user_email",
                                out var emailElement)
                                ? emailElement.GetString()
                                    ?? string.Empty
                                : string.Empty;

                        // =============================================
                        // Join Time
                        // =============================================

                        DateTimeOffset? joinTime = null;

                        if (item.TryGetProperty(
                                "join_time",
                                out var joinElement)
                            &&
                            joinElement.ValueKind ==
                                JsonValueKind.String)
                        {
                            if (DateTimeOffset.TryParse(
                                    joinElement.GetString(),
                                    out var parsedJoin))
                            {
                                joinTime = parsedJoin;
                            }
                        }

                        if (!joinTime.HasValue)
                        {
                            Console.WriteLine(
                                $"[ZOOM ATTENDANCE] " +
                                $"Skipping participant without valid join time. " +
                                $"Name={name}, Email={email}");

                            continue;
                        }

                        // =============================================
                        // Leave Time
                        // =============================================

                        DateTimeOffset? leaveTime = null;

                        if (item.TryGetProperty(
                                "leave_time",
                                out var leaveElement)
                            &&
                            leaveElement.ValueKind ==
                                JsonValueKind.String)
                        {
                            if (DateTimeOffset.TryParse(
                                    leaveElement.GetString(),
                                    out var parsedLeave))
                            {
                                leaveTime = parsedLeave;
                            }
                        }

                        // =============================================
                        // Duration
                        // =============================================

                        var durationMinutes = 0;

                        if (leaveTime.HasValue &&
                            leaveTime.Value > joinTime.Value)
                        {
                            durationMinutes =
                                (int)Math.Round(
                                    (
                                        leaveTime.Value -
                                        joinTime.Value
                                    ).TotalMinutes,
                                    MidpointRounding.AwayFromZero);
                        }

                        participants.Add(
                            new MeetingParticipantDto
                            {
                                ParticipantId =
                                    participantId,

                                Name =
                                    name,

                                Email =
                                    email,

                                JoinTime =
                                    joinTime.Value.UtcDateTime,

                                LeaveTime =
                                    leaveTime?.UtcDateTime,

                                DurationMinutes =
                                    durationMinutes
                            });

                        Console.WriteLine(
                            $"[ZOOM ATTENDANCE] Participant found. " +
                            $"Name={name}, " +
                            $"Email={email}, " +
                            $"ParticipantId={participantId}, " +
                            $"Join={joinTime.Value.UtcDateTime:O}, " +
                            $"Leave={(leaveTime.HasValue
                                ? leaveTime.Value.UtcDateTime.ToString("O")
                                : "null")}, " +
                            $"Duration={durationMinutes} min");
                    }
                }

                // =============================================
                // Pagination
                // =============================================

                nextPageToken = null;

                if (root.TryGetProperty(
                        "next_page_token",
                        out var nextTokenElement)
                    &&
                    nextTokenElement.ValueKind ==
                        JsonValueKind.String)
                {
                    nextPageToken =
                        nextTokenElement.GetString();
                }

            }
            while (!string.IsNullOrWhiteSpace(nextPageToken));

            Console.WriteLine(
                $"[ZOOM ATTENDANCE] " +
                $"Total participants retrieved: {participants.Count}");

            return participants;
        }





        public override Task<bool> ValidateWebhookAsync(
            HttpRequest request)
        {
            var secret =
                _configuration["Zoom:WebhookSecret"];

            if (string.IsNullOrWhiteSpace(secret))
                return Task.FromResult(false);

            if (!request.Headers.TryGetValue(
                    "Authorization",
                    out var token))
            {
                return Task.FromResult(false);
            }

            return Task.FromResult(
                token.ToString() == secret);
        }

        public override async Task<string?> GetRecordingUrlAsync(
            string meetingId)
        {
            if (string.IsNullOrWhiteSpace(meetingId))
                return null;

            var accessToken =
                await GetAccessTokenAsync();

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    accessToken);

            using var response =
                await _httpClient.GetAsync(
                    $"https://api.zoom.us/v2/meetings/" +
                    $"{meetingId}/recordings");

            if (!response.IsSuccessStatusCode)
                return null;

            var json =
                await response.Content.ReadAsStringAsync();

            using var document =
                JsonDocument.Parse(json);

            if (!document.RootElement.TryGetProperty(
                    "recording_files",
                    out var files))
            {
                return null;
            }

            foreach (var file in
                     files.EnumerateArray())
            {
                if (file.TryGetProperty(
                        "file_type",
                        out var fileType)
                    &&
                    fileType.GetString()
                        ?.Equals(
                            "MP4",
                            StringComparison.OrdinalIgnoreCase)
                        == true)
                {
                    return file.TryGetProperty(
                               "download_url",
                               out var downloadUrl)
                        ? downloadUrl.GetString()
                        : null;
                }
            }

            return null;
        }
    }
}