using Microsoft.AspNetCore.Http;
using TalentSphereAPI.DTOs.Chat;

namespace TalentSphereAPI.Services
{
    public interface IChatService
    {
        Task<ChatConversationDto> CreateConversationAsync(
            CreateConversationDto dto);

        Task<List<ChatConversationDto>> GetConversationsAsync();

        Task<List<ChatMessageDto>> GetMessagesAsync(
            int conversationId,
            int page = 1,
            int pageSize = 50);

        Task<ChatMessageDto> SendMessageAsync(
            int conversationId,
            SendMessageDto dto);

        Task MarkAsReadAsync(
            int conversationId);

        Task<ChatAttachmentDto> UploadAttachmentAsync(
            int conversationId,
            IFormFile file,
            string? message);

        Task<(byte[] FileBytes, string ContentType, string FileName)>
            DownloadAttachmentAsync(
                int attachmentId);

        Task<(byte[] FileBytes, string ContentType, string FileName)>
            ViewAttachmentAsync(
                int attachmentId);

        Task DeleteAttachmentAsync(
            int attachmentId);
    }
}