namespace TalentSphereAPI.DTOs.LiveClass

{

    public class RecordingResponseDto

    {

        public int LiveClassId { get; set; }

        public string RecordingName { get; set; } = string.Empty;

        public string RecordingUrl { get; set; } = string.Empty;

        public DateTime UploadedAt { get; set; }

    }

}
