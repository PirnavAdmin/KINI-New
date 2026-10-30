namespace TalentSphereAPI.Services.Interfaces
{
    public interface IOpenRouterService
    {
        Task<string> GetChatResponseAsync(string prompt);
    }
}