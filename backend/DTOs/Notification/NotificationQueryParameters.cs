namespace TalentSphereAPI.DTOs.Notification

{

    public class NotificationQueryParameters

    {

        public bool? IsRead { get; set; }

        public int PageNumber { get; set; } = 1;

        public int PageSize { get; set; } = 10;

    }

}
