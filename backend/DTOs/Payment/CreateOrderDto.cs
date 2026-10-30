namespace TalentSphereAPI.DTOs.Payment
{
    public class CreateOrderDto
    {
        public int UserId { get; set; }

        public decimal Amount { get; set; }

        public string Currency { get; set; } = "INR";

        public string? CouponCode { get; set; }
    }
}