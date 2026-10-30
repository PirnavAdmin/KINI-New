namespace TalentSphereAPI.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(
            string toEmail,
            string subject,
            string body);

        Task SendOtpAsync(
            string toEmail,
            string otp);

        Task SendMentorWelcomeEmailAsync(
            string email,
            string firstName,
            string lastName,
            string temporaryPassword);

        Task SendEmployeeWelcomeEmailAsync(
            string email,
            string firstName,
            string lastName,
            string temporaryPassword);

        Task SendStudentWelcomeEmailAsync(
            string email,
            string firstName,
            string lastName,
            string temporaryPassword);

        Task SendEmailWithAttachmentAsync(
            string to,
            string subject,
            string body,
            byte[] attachment,
            string fileName);
    }
}