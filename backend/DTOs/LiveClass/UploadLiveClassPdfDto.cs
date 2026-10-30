using Microsoft.AspNetCore.Http;

namespace TalentSphereAPI.DTOs.LiveClass

{

    public class UploadLiveClassPdfDto

    {

        public int LiveClassId { get; set; }

        public IFormFile PdfFile { get; set; } = null!;

    }

}
