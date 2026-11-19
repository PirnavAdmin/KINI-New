namespace TalentSphereAPI.DTOs
{
    /// <summary>
    /// verify-otp response. When the verified identifier belongs to an account,
    /// it also carries a single-use, reset-only token for POST /api/Auth/reset-password.
    /// </summary>
    public class VerifyOtpResponseDto : ApiResponseDto
    {
        public string? ResetToken { get; set; }

        public DateTime? ResetTokenExpiresAt { get; set; }
    }
}
