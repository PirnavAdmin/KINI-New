using Microsoft.AspNetCore.Authorization;

using Microsoft.AspNetCore.Mvc;

using TalentSphereAPI.DTOs.LiveClass;

using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers

{

    [ApiController]

    [Route("api/v1/live-classes")]

   

    public class LiveClassPdfController : ControllerBase

    {

        private readonly ILiveClassPdfService _service;

        public LiveClassPdfController(

            ILiveClassPdfService service)

        {

            _service = service;

        }

        [HttpPost("upload-pdf")]

        [Consumes("multipart/form-data")]

        public async Task<IActionResult> UploadPdf(

            [FromForm] UploadLiveClassPdfDto dto)

        {

            await _service.UploadPdfAsync(dto);

            return Ok(new

            {

                success = true,

                message = "PDF uploaded successfully."

            });

        }

        [HttpGet("{liveClassId}/pdf")]

        public async Task<IActionResult> GetPdf(

            int liveClassId)

        {

            var result =

                await _service.GetPdfAsync(liveClassId);

            return Ok(new

            {

                success = true,

                data = result

            });

        }

        [HttpDelete("{liveClassId}/pdf")]

        public async Task<IActionResult> DeletePdf(

            int liveClassId)

        {

            await _service.DeletePdfAsync(liveClassId);

            return Ok(new

            {

                success = true,

                message = "PDF deleted successfully."

            });

        }

    }

}
