namespace TalentSphereAPI.DTOs.Payment
{
    public class VerifyPaymentDto
    {
        public int OrderId { get; set; }

        public string PaymentId { get; set; } = string.Empty;

        public string Signature { get; set; } = string.Empty;
    }
}