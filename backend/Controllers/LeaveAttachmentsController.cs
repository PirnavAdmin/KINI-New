using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    /// <summary>
    /// Supporting (medical) documents for leave requests. The employee who
    /// applied may upload and read their own; users with the "Leave Management"
    /// permission may read (view) and upload (edit). Files are private and only
    /// served through these endpoints.
    /// </summary>
    [ApiController]
    [Authorize]
    [Route("api/hr/leave")]
    public class LeaveAttachmentsController : ControllerBase
    {
        private readonly ILeaveAttachmentService _service;

        public LeaveAttachmentsController(ILeaveAttachmentService service)
        {
            _service = service;
        }

        // POST /api/hr/leave/{leaveId}/attachments  (multipart/form-data, field "file")
        [HttpPost("{leaveId:int}/attachments")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(LeaveAttachmentService.MaxBytes + 64 * 1024)]
        [ProducesResponseType(typeof(LeaveAttachmentDto), StatusCodes.Status201Created)]
        public Task<IActionResult> Upload(int leaveId, [FromForm] UploadLeaveAttachmentDto form) =>
            Run(async () =>
            {
                var file = form.File ?? Request.Form.Files.FirstOrDefault();
                var result = await _service.UploadAsync(User, leaveId, file, HttpContext.RequestAborted);
                return StatusCode(StatusCodes.Status201Created, new
                {
                    success = true,
                    message = "Document uploaded successfully.",
                    data = result
                });
            });

        // GET /api/hr/leave/{leaveId}/attachments
        [HttpGet("{leaveId:int}/attachments")]
        [ProducesResponseType(typeof(List<LeaveAttachmentDto>), StatusCodes.Status200OK)]
        public Task<IActionResult> List(int leaveId) =>
            Run(async () => Ok(new
            {
                success = true,
                data = await _service.ListAsync(User, leaveId, HttpContext.RequestAborted)
            }));

        // GET /api/hr/leave/attachments/{attachmentId}/view  (inline preview)
        [HttpGet("attachments/{attachmentId:int}/view")]
        public Task<IActionResult> View(int attachmentId) => Serve(attachmentId, inline: true);

        // GET /api/hr/leave/attachments/{attachmentId}/download
        [HttpGet("attachments/{attachmentId:int}/download")]
        public Task<IActionResult> Download(int attachmentId) => Serve(attachmentId, inline: false);

        private Task<IActionResult> Serve(int attachmentId, bool inline) =>
            Run(async () =>
            {
                var (content, contentType, fileName) = await _service.OpenAsync(User, attachmentId, HttpContext.RequestAborted);
                Response.Headers.CacheControl = "private, no-store";
                Response.Headers["X-Content-Type-Options"] = "nosniff";

                if (!inline)
                    return File(content, contentType, fileName);

                var disposition = new System.Net.Mime.ContentDisposition { Inline = true, FileName = fileName };
                Response.Headers.ContentDisposition = disposition.ToString();
                return File(content, contentType);
            });

        private async Task<IActionResult> Run(Func<Task<IActionResult>> action)
        {
            try
            {
                return await action();
            }
            catch (LeaveAttachmentException ex)
            {
                return StatusCode(ex.StatusCode, new
                {
                    success = false,
                    message = ex.Message,
                    error = new { code = ex.Code, message = ex.Message }
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message, error = new { code = "UNAUTHORIZED", message = ex.Message } });
            }
        }
    }
}
