using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs.Chat;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Authorize(Roles = "Mentor,Student")]
    [Route("api/v1/chat")]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;

        public ChatController(
            IChatService chatService)
        {
            _chatService = chatService;
        }

        // =====================================================
        // GET CONVERSATIONS
        // =====================================================

        [HttpGet("conversations")]
        public async Task<IActionResult>
            GetConversations()
        {
            try
            {
                var result =
                    await _chatService
                        .GetConversationsAsync();

                return Ok(new
                {
                    success = true,
                    data = result
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // =====================================================
        // CREATE CONVERSATION
        // =====================================================

        [HttpPost("conversations")]
        public async Task<IActionResult>
            CreateConversation(
                [FromBody] CreateConversationDto dto)
        {
            try
            {
                var result =
                    await _chatService
                        .CreateConversationAsync(dto);

                return Ok(new
                {
                    success = true,
                    message = "Conversation ready.",
                    data = result
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // =====================================================
        // GET MESSAGES
        // =====================================================

        [HttpGet(
            "conversations/{conversationId:int}/messages")]
        public async Task<IActionResult>
            GetMessages(
                int conversationId,
                [FromQuery] int page = 1,
                [FromQuery] int pageSize = 50)
        {
            try
            {
                var result =
                    await _chatService
                        .GetMessagesAsync(
                            conversationId,
                            page,
                            pageSize);

                return Ok(new
                {
                    success = true,
                    data = result
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    new
                    {
                        success = false,
                        message = ex.Message
                    });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // =====================================================
        // SEND MESSAGE
        // =====================================================

        [HttpPost(
            "conversations/{conversationId:int}/messages")]
        public async Task<IActionResult>
            SendMessage(
                int conversationId,
                [FromBody] SendMessageDto dto)
        {
            try
            {
                var result =
                    await _chatService
                        .SendMessageAsync(
                            conversationId,
                            dto);

                return Ok(new
                {
                    success = true,
                    message =
                        "Message sent successfully.",
                    data = result
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    new
                    {
                        success = false,
                        message = ex.Message
                    });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // =====================================================
        // MARK AS READ
        // =====================================================

        [HttpPut(
            "conversations/{conversationId:int}/read")]
        public async Task<IActionResult>
            MarkAsRead(
                int conversationId)
        {
            try
            {
                await _chatService
                    .MarkAsReadAsync(
                        conversationId);

                return Ok(new
                {
                    success = true,
                    message =
                        "Messages marked as read."
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    new
                    {
                        success = false,
                        message = ex.Message
                    });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // =====================================================
        // UPLOAD ATTACHMENT
        // =====================================================

        [HttpPost(
            "conversations/{conversationId:int}/attachments")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult>
            UploadAttachment(
                int conversationId,
                IFormFile file,
                [FromForm] string? message)
        {
            try
            {
                var result =
                    await _chatService
                        .UploadAttachmentAsync(
                            conversationId,
                            file,
                            message);

                return Ok(new
                {
                    success = true,
                    data = result
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    new
                    {
                        success = false,
                        message = ex.Message
                    });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (ChatFileTooLargeException ex)
            {
                return StatusCode(
                    StatusCodes.Status413PayloadTooLarge,
                    new
                    {
                        success = false,
                        message = ex.Message
                    });
            }
            catch (ChatUnsupportedFileException ex)
            {
                return StatusCode(
                    StatusCodes.Status415UnsupportedMediaType,
                    new
                    {
                        success = false,
                        message = ex.Message
                    });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // =====================================================
        // DOWNLOAD ATTACHMENT
        // =====================================================

        [HttpGet(
            "attachments/{attachmentId:int}/download")]
        public async Task<IActionResult>
            DownloadAttachment(
                int attachmentId)
        {
            try
            {
                var result =
                    await _chatService
                        .DownloadAttachmentAsync(
                            attachmentId);

                return File(
                    result.FileBytes,
                    result.ContentType,
                    result.FileName);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    new
                    {
                        success = false,
                        message = ex.Message
                    });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // =====================================================
        // VIEW ATTACHMENT
        // =====================================================

        [HttpGet(
            "attachments/{attachmentId:int}/view")]
        public async Task<IActionResult>
            ViewAttachment(
                int attachmentId)
        {
            try
            {
                var result =
                    await _chatService
                        .ViewAttachmentAsync(
                            attachmentId);

                Response.Headers.Append(
                    "Content-Disposition",
                    $"inline; filename=\"{result.FileName}\"");

                return File(
                    result.FileBytes,
                    result.ContentType);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    new
                    {
                        success = false,
                        message = ex.Message
                    });
            }
            catch (ChatUnsupportedFileException ex)
            {
                return StatusCode(
                    StatusCodes.Status415UnsupportedMediaType,
                    new
                    {
                        success = false,
                        message = ex.Message
                    });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // =====================================================
        // DELETE ATTACHMENT
        // =====================================================

        [HttpDelete(
            "attachments/{attachmentId:int}")]
        public async Task<IActionResult>
            DeleteAttachment(
                int attachmentId)
        {
            try
            {
                await _chatService
                    .DeleteAttachmentAsync(
                        attachmentId);

                return Ok(new
                {
                    success = true,
                    message =
                        "Attachment deleted successfully."
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    new
                    {
                        success = false,
                        message = ex.Message
                    });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}