namespace TalentSphereAPI.Models
{
    public class Coupon
    {
        public int Id { get; set; }

        public string CouponCode { get; set; } = string.Empty;

        // Existing percentage-based discount.
        // Example: 10 = 10%
        public decimal DiscountPercentage { get; set; }

        // Optional fixed discount.
        // Example: 500 = ₹500 off
        public decimal? DiscountAmount { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime ExpiryDate { get; set; }
    }
}