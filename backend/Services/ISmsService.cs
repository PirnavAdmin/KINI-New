namespace TalentSphereAPI.Services.Interfaces
{
    public interface ISmsService
    {
        Task SendOtpAsync(string phone, string otp);
    }
}