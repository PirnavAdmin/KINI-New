namespace TalentSphereAPI.DTOs.Notification

{

    public class NotificationResponseDto

    {

        public int NotificationId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public string NotificationType { get; set; } = string.Empty;

        public int ReferenceId { get; set; }

        public string ReferenceType { get; set; } = string.Empty;

        public bool IsRead { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? ReadAt { get; set; }

    }

}
