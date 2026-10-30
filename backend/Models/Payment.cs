namespace TalentSphereAPI.Models
{
    public class Payment
    {
        public int Id { get; set; }

        public int OrderId { get; set; }

        public string PaymentId { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public DateTime PaidOn { get; set; } = DateTime.UtcNow;
    }
}