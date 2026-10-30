using Microsoft.AspNetCore.Http;

namespace TalentSphereAPI.DTOs.LiveClass

{

    public class UploadRecordingDto

    {

        public int LiveClassId { get; set; }

        public IFormFile Recording { get; set; } = null!;

    }

}
