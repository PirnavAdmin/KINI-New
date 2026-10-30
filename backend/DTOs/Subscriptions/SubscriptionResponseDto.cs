namespace TalentSphereAPI.DTOs.Subscriptions

{

    public class SubscriptionResponseDto

    {

        public int SubscriptionId { get; set; }

        public string PlanName { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int DurationInMonths { get; set; }

        public int MaxUsers { get; set; }

        public bool IsActive { get; set; }

    }

}
