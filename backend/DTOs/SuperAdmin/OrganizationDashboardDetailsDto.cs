namespace TalentSphereAPI.DTOs.SuperAdmin
{
    public class OrganizationDashboardDetailsDto
    {
        public int OrganizationId { get; set; }

        public string OrganizationName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Industry { get; set; } = string.Empty;

        public string Country { get; set; } = string.Empty;

        public string Website { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; }

        public string? SubscriptionPlan { get; set; }

        public decimal? SubscriptionPrice { get; set; }

        public int? SubscriptionDurationInMonths { get; set; }

        public int? MaxUsers { get; set; }

        public DateTime? SubscriptionStartDate { get; set; }

        public DateTime? SubscriptionExpiryDate { get; set; }

        public bool HasActiveSubscription { get; set; }
    }
}