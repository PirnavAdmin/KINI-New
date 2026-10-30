using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services
{
    public class Msg91SmsService : ISmsService
    {
        private readonly HttpClient _httpClient;
        private readonly MSG91Settings _settings;
        private readonly ILogger<Msg91SmsService> _logger;

        public Msg91SmsService(
            HttpClient httpClient,
            IOptions<MSG91Settings> options,
            ILogger<Msg91SmsService> logger)
        {
            _httpClient = httpClient;
            _settings = options.Value;
            _logger = logger;
        }

        public async Task SendOtpAsync(string phone, string otp)
        {
            if (string.IsNullOrWhiteSpace(phone))
                throw new ArgumentException("Phone number cannot be empty.");

            if (string.IsNullOrWhiteSpace(otp))
                throw new ArgumentException("OTP cannot be empty.");

            var request = new
            {
                template_id = _settings.TemplateId,
                sender = _settings.SenderId,
                short_url = "0",
                mobiles = $"91{phone}",
                var1 = otp
            };

            var json = JsonSerializer.Serialize(request);

            var content = new StringContent(
                json,
                Encoding.UTF8,
                "application/json");

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("authkey", _settings.AuthKey);

            try
            {
                var response = await _httpClient.PostAsync(
                    "https://control.msg91.com/api/v5/flow/",
                    content);

                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError(
                        "MSG91 Error: {StatusCode} - {Response}",
                        response.StatusCode,
                        responseBody);

                    throw new Exception(
                        $"MSG91 SMS sending failed. Status: {response.StatusCode}. Response: {responseBody}");
                }

                _logger.LogInformation(
                    "OTP SMS sent successfully to {Phone}. Response: {Response}",
                    phone,
                    responseBody);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while sending OTP SMS to {Phone}", phone);
                throw;
            }
        }
    }
}