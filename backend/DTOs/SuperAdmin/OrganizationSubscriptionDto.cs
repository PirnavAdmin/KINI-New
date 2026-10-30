namespace TalentSphereAPI.DTOs.SuperAdmin
{
    public class OrganizationSubscriptionDto
    {
        public int SubscriptionId { get; set; }

        public int OrganizationId { get; set; }

        public string OrganizationName { get; set; } = string.Empty;

        public string PlanName { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int DurationInMonths { get; set; }

        public int MaxUsers { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime ExpiryDate { get; set; }

        public bool IsActive { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}