using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services
{
    public class OpenRouterService : IOpenRouterService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        private readonly string[] _models =
        {
            "openai/gpt-oss-120b:free",
            "deepseek/deepseek-r1:free",
            "qwen/qwen3-235b-a22b:free",
            "cohere/north-mini-code:free"
        };

        public OpenRouterService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<string> GetChatResponseAsync(string prompt)
        {
            var apiKey = _configuration["OpenRouter:ApiKey"];
            var url = _configuration["OpenRouter:BaseUrl"];

            if (string.IsNullOrWhiteSpace(apiKey))
                throw new Exception("OpenRouter API Key is missing.");

            if (string.IsNullOrWhiteSpace(url))
                throw new Exception("OpenRouter BaseUrl is missing.");

            _httpClient.DefaultRequestHeaders.Clear();

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", apiKey);

            _httpClient.DefaultRequestHeaders.Add("HTTP-Referer", "http://localhost");
            _httpClient.DefaultRequestHeaders.Add("X-Title", "TalentSphere AI");

            foreach (var model in _models)
            {
                try
                {
                    var requestBody = new
                    {
                        model = model,
                        messages = new[]
                        {
                            new
                            {
                                role = "user",
                                content = prompt
                            }
                        }
                    };

                    var json = JsonSerializer.Serialize(requestBody);

                    var response = await _httpClient.PostAsync(
                        url,
                        new StringContent(json, Encoding.UTF8, "application/json"));

                    var responseText = await response.Content.ReadAsStringAsync();

                    Console.WriteLine("----------------------------------------");
                    Console.WriteLine($"Model : {model}");
                    Console.WriteLine($"Status: {(int)response.StatusCode}");
                    Console.WriteLine(responseText);
                    Console.WriteLine("----------------------------------------");

                    if (!response.IsSuccessStatusCode)
                        continue;

                    using var document = JsonDocument.Parse(responseText);

                    return document.RootElement
                        .GetProperty("choices")[0]
                        .GetProperty("message")
                        .GetProperty("content")
                        .GetString() ?? "No response.";
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Model {model} failed.");
                    Console.WriteLine(ex.ToString());
                }
            }

            return "Sorry, all free AI models are currently unavailable.";
        }
    }
}