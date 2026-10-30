namespace TalentSphereAPI.DTOs
{
    public class VerifyOtpDto
    {
        public string Identifier { get; set; } = string.Empty;

        public string OtpType { get; set; } = string.Empty;

        public string Otp { get; set; } = string.Empty;
    }
}
