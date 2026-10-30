using TalentSphereAPI.DTOs.Team;

namespace TalentSphereAPI.Services

{

    public interface ITeamService

    {

        Task<string> AddTeamAsync(CreateTeamDto dto);

        Task<List<TeamResponseDto>> GetTeamsAsync();

        Task<TeamResponseDto?> GetTeamByIdAsync(int id);

        Task<string> UpdateTeamAsync(int id, UpdateTeamDto dto);

        Task<string> DeleteTeamAsync(int id);

    }

}
