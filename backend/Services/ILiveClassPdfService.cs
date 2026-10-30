using TalentSphereAPI.DTOs.LiveClass;

namespace TalentSphereAPI.Services

{

    public interface ILiveClassPdfService

    {

        Task UploadPdfAsync(UploadLiveClassPdfDto dto);

        Task<LiveClassPdfResponseDto> GetPdfAsync(int liveClassId);

        Task DeletePdfAsync(int liveClassId);

    }

}
