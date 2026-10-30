namespace TalentSphereAPI.Models
{
    public class Order
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public decimal Amount { get; set; }

        public string Currency { get; set; } = "INR";

        public string Status { get; set; } = "Pending";

        public string? CouponCode { get; set; }

        public decimal Discount { get; set; }

        public decimal FinalAmount { get; set; }

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    }
}