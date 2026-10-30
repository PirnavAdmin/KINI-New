using TalentSphereAPI.DTOs.LiveClass;

namespace TalentSphereAPI.Services
{
    public interface ILiveClassRecordingService
    {
        Task UploadRecordingAsync(UploadRecordingDto dto);

        Task<RecordingResponseDto> GetRecordingAsync(
            int liveClassId);

        Task<(Stream Stream, string ContentType, string FileName)>
            OpenRecordingStreamAsync(int liveClassId);

        Task DeleteRecordingAsync(int liveClassId);
    }
}