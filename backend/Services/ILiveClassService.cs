using TalentSphereAPI.DTOs.LiveClass;

namespace TalentSphereAPI.Services

{

    public interface ILiveClassService

    {

        Task<(IEnumerable<LiveClassResponseDto> Classes, int TotalCount)>

            GetAllAsync(LiveClassQueryParameters query);

        Task<LiveClassResponseDto?> GetByIdAsync(int id);

        Task<LiveClassResponseDto> CreateAsync(
    CreateLiveClassDto dto);

        Task<bool> UpdateAsync(int id, UpdateLiveClassDto dto);

        Task<bool> DeleteAsync(int id);

        Task<bool> StartClassAsync(int id);

        Task<bool> EndClassAsync(int id, DateTime? endedAtUtc = null);

        Task<bool> CancelClassAsync(int id);

        Task<IEnumerable<LiveClassListDto>> GetTodaysClassesAsync();

        Task<JoinLiveClassResponseDto> JoinLiveClassAsync(int liveClassId);

    }

}
