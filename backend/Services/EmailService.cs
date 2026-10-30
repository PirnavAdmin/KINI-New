using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(
            IOptions<EmailSettings> settings,
            ILogger<EmailService> logger)
        {
            _settings = settings.Value;
            _logger = logger;

            _logger.LogInformation(
                "SMTP Server: {Server}",
                _settings.SmtpServer);

            _logger.LogInformation(
                "Port: {Port}",
                _settings.Port);

            _logger.LogInformation(
                "Username: {Username}",
                _settings.Username);

            _logger.LogInformation(
                "From: {From}",
                _settings.From);

            _logger.LogInformation(
                "Password Length: {Length}",
                _settings.Password?.Length);
        }

        // =========================================================
        // SEND NORMAL EMAIL
        // =========================================================

        public async Task SendEmailAsync(
            string toEmail,
            string subject,
            string body)
        {
            try
            {
                var email = new MimeMessage();

                email.From.Add(
                    new MailboxAddress(
                        "Kini EdX Hub",
                        _settings.From));

                email.To.Add(
                    MailboxAddress.Parse(toEmail));

                email.Subject = subject;

                email.Body = new BodyBuilder
                {
                    HtmlBody = body
                }.ToMessageBody();

                using var smtp = new SmtpClient();

                await smtp.ConnectAsync(
                    _settings.SmtpServer,
                    _settings.Port,
                    SecureSocketOptions.StartTls);

                // Remove OAuth2 so SMTP username/password authentication is used
                smtp.AuthenticationMechanisms.Remove("XOAUTH2");

                _logger.LogInformation(
                    "SMTP Server: {Server}",
                    _settings.SmtpServer);

                _logger.LogInformation(
                    "Port: {Port}",
                    _settings.Port);

                _logger.LogInformation(
                    "Username: {Username}",
                    _settings.Username);

                _logger.LogInformation(
                    "SMTP Password Length: {Length}",
                    _settings.Password?.Length ?? 0);

                _logger.LogInformation(
                    "From: {From}",
                    _settings.From);

                await smtp.AuthenticateAsync(
                    _settings.Username?.Trim() ?? string.Empty,
                    _settings.Password?.Trim() ?? string.Empty);

                await smtp.SendAsync(email);

                await smtp.DisconnectAsync(true);

                _logger.LogInformation(
                    "Email sent successfully to {Email}",
                    toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "SMTP Error while sending email.");

                throw new Exception(
                    $"Email sending failed. {ex.Message}",
                    ex);
            }
        }

        // =========================================================
        // SEND OTP
        // =========================================================

        public async Task SendOtpAsync(
            string toEmail,
            string otp)
        {
            var subject = "Kini EdX Hub - OTP Verification";

            var body = $@"
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }}

        .container {{
            background: #ffffff;
            padding: 25px;
            border-radius: 10px;
            max-width: 600px;
            margin: auto;
            border: 1px solid #ddd;
        }}

        .otp {{
            font-size: 32px;
            font-weight: bold;
            color: #0d6efd;
            letter-spacing: 5px;
            text-align: center;
            margin: 25px 0;
        }}

        .footer {{
            margin-top: 30px;
            color: gray;
            font-size: 12px;
        }}
    </style>
</head>

<body>

<div class='container'>

    <h2>Kini EdX Hub - OTP Verification</h2>

    <p>Your OTP is:</p>

    <div class='otp'>
        {otp}
    </div>

    <p>
        Please use this OTP to complete your verification.
    </p>

    <div class='footer'>
        Thanks,<br/>
        Kini EdX Hub Team
    </div>

</div>

</body>
</html>
";

            await SendEmailAsync(
                toEmail,
                subject,
                body);
        }

        // =========================================================
        // MENTOR WELCOME EMAIL
        // =========================================================

        public async Task SendMentorWelcomeEmailAsync(
            string email,
            string firstName,
            string lastName,
            string temporaryPassword)
        {
            string subject =
                "Welcome to Kini Edx Hub - Mentor Login Credentials";

            string body = $@"
<html>
<body>

    <h2>Welcome to Kini EdX Hub</h2>

    <p>
        Hello <strong>{firstName} {lastName}</strong>,
    </p>

    <p>
        Your mentor account has been created successfully.
    </p>

    <p>
        <strong>Email:</strong> {email}
    </p>

    <p>
        <strong>Temporary Password:</strong>
        {temporaryPassword}
    </p>

    <p>
        Please change your password after your first login.
    </p>

    <p>
        Thanks,<br/>
        Kini Edx Hub Team
    </p>

</body>
</html>
";

            await SendEmailAsync(
                email,
                subject,
                body);
        }

        // =========================================================
        // EMPLOYEE WELCOME EMAIL
        // =========================================================

        public async Task SendEmployeeWelcomeEmailAsync(
            string email,
            string firstName,
            string lastName,
            string temporaryPassword)
        {
            string subject =
                "Welcome to Kini Edx Hub - Employee Login Credentials";

            string body = $@"
<html>
<body>

    <h2>Welcome to Kini EdX Hub</h2>

    <p>
        Hello <strong>{firstName} {lastName}</strong>,
    </p>

    <p>
        Your employee account has been created successfully.
    </p>

    <p>
        <strong>Email:</strong> {email}
    </p>

    <p>
        <strong>Temporary Password:</strong>
        {temporaryPassword}
    </p>

    <p>
        Please change your password after your first login.
    </p>

    <p>
        Thanks,<br/>
        Kini Edx Hub Team
    </p>

</body>
</html>
";

            await SendEmailAsync(
                email,
                subject,
                body);
        }

        // =========================================================
        // STUDENT WELCOME EMAIL
        // =========================================================

        public async Task SendStudentWelcomeEmailAsync(
            string email,
            string firstName,
            string lastName,
            string temporaryPassword)
        {
            string subject =
                "Welcome to Kini Edx Hub - Student Login Credentials";

            string body = $@"
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }}

        .container {{
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            max-width: 600px;
            margin: auto;
            border: 1px solid #ddd;
        }}

        h2 {{
            color: #0d6efd;
        }}

        .credentials {{
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }}

        .password {{
            font-size: 20px;
            font-weight: bold;
            color: #dc3545;
        }}

        .footer {{
            margin-top: 30px;
            color: gray;
            font-size: 12px;
        }}
    </style>
</head>

<body>

<div class='container'>

    <h2>Welcome to Kini Edx Hub</h2>

    <p>
        Hello <strong>{firstName} {lastName}</strong>,
    </p>

    <p>
        Your student account has been created successfully.
    </p>

    <p>
        You can use the following credentials to log in:
    </p>

    <div class='credentials'>

        <p>
            <strong>Email:</strong> {email}
        </p>

        <p>
            <strong>Temporary Password:</strong>
            <span class='password'>{temporaryPassword}</span>
        </p>

    </div>

    <p>
        Please change your password after your first login.
    </p>

    <div class='footer'>
        Thanks,<br/>
        Kini Edx Hub Team
    </div>

</div>

</body>
</html>
";

            await SendEmailAsync(
                email,
                subject,
                body);
        }

        // =========================================================
        // EMAIL WITH ATTACHMENT
        // =========================================================

        public async Task SendEmailWithAttachmentAsync(
            string to,
            string subject,
            string body,
            byte[] attachment,
            string fileName)
        {
            var message = new MimeMessage();

            message.From.Add(
                new MailboxAddress(
                    "Kini EdX Hub",
                    _settings.From));

            message.To.Add(
                MailboxAddress.Parse(to));

            message.Subject = subject;

            var builder = new BodyBuilder
            {
                HtmlBody = body
            };

            builder.Attachments.Add(
                fileName,
                attachment);

            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();

            await client.ConnectAsync(
                _settings.SmtpServer,
                _settings.Port,
                SecureSocketOptions.StartTls);

            client.AuthenticationMechanisms.Remove("XOAUTH2");

            await client.AuthenticateAsync(
                _settings.Username,
                _settings.Password);

            await client.SendAsync(message);

            await client.DisconnectAsync(true);
        }
    }
}