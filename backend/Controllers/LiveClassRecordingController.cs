using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.LiveClass;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/v1/live-classes")]
    [Authorize]
    public class LiveClassRecordingController : ControllerBase
    {
        private readonly ILiveClassRecordingService _service;

        public LiveClassRecordingController(
            ILiveClassRecordingService service)
        {
            _service = service;
        }

        // ============================================================
        // UPLOAD / REPLACE RECORDING
        // ============================================================

        [HttpPut("{liveClassId:int}/recording")]
        [HasPermission("LiveClass", "Edit")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(1_073_741_824)]
        public async Task<IActionResult> UploadRecording(
            int liveClassId,
            [FromForm] UploadRecordingDto dto)
        {
            try
            {
                dto.LiveClassId = liveClassId;

                await _service.UploadRecordingAsync(dto);

                return Ok(new
                {
                    success = true,
                    message =
                        "Recording uploaded successfully."
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
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
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

        // ============================================================
        // GET RECORDING INFORMATION
        // ============================================================

        [HttpGet("{liveClassId:int}/recording")]
        public async Task<IActionResult> GetRecording(
            int liveClassId)
        {
            try
            {
                var result =
                    await _service.GetRecordingAsync(
                        liveClassId);

                return Ok(new
                {
                    success = true,
                    data = result
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
        }

        // ============================================================
        // STREAM / WATCH RECORDING
        // ============================================================

        [HttpGet("{liveClassId:int}/recording/stream")]
        public async Task<IActionResult> StreamRecording(
            int liveClassId)
        {
            try
            {
                var result =
                    await _service
                        .OpenRecordingStreamAsync(
                            liveClassId);

                return File(
                    result.Stream,
                    result.ContentType,
                    enableRangeProcessing: true);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    success = false,
                    message = ex.Message
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
        }

        // ============================================================
        // DELETE RECORDING
        // ============================================================

        [HttpDelete("{liveClassId:int}/recording")]
        [HasPermission("LiveClass", "Delete")]
        public async Task<IActionResult> DeleteRecording(
            int liveClassId)
        {
            try
            {
                await _service.DeleteRecordingAsync(
                    liveClassId);

                return Ok(new
                {
                    success = true,
                    message =
                        "Recording deleted successfully."
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
        }
    }
}