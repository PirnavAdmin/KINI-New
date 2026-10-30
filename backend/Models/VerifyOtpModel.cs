public class OtpVerification
{
    public int OtpVerificationId { get; set; }

    public string Identifier { get; set; } = string.Empty;

    public string Otp { get; set; } = string.Empty;

    public string OtpType { get; set; } = string.Empty;

    public bool IsVerified { get; set; }

    public bool IsUsed { get; set; } = false;

    public DateTime ExpiryTime { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
}