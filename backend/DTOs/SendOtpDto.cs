namespace TalentSphereAPI.DTOs
{
    public class SendOtpDto
    {
        public string Identifier { get; set; } = string.Empty;

        // Email or Mobile
        public string OtpType { get; set; } = string.Empty;
    }
}
