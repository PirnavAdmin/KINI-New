namespace TalentSphereAPI.DTOs
{
    public class ForgotPasswordDto
    {
        public string Identifier { get; set; } = string.Empty;

        public string OtpType { get; set; } = string.Empty;
    }
}