using TalentSphereAPI.DTOs.LiveClass;

namespace TalentSphereAPI.Services

{

    public interface ILiveClassDashboardService

    {

        Task<LiveClassDashboardDto> GetDashboardAsync();

        Task<IEnumerable<LiveClassListDto>> GetUpcomingAsync();

        Task<IEnumerable<LiveClassListDto>> GetCompletedAsync();

        Task<IEnumerable<LiveClassListDto>> GetLiveAsync();

    }

}
