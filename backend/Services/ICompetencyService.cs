using TalentSphereAPI.DTOs;

namespace TalentSphereAPI.Services

{

    public interface ICompetencyService

    {

        Task<IEnumerable<CompetencyResponseDto>> GetAllAsync();

        Task<CompetencyResponseDto?> GetByIdAsync(int id);

        Task CreateAsync(CreateCompetencyDto dto);

        Task<bool> UpdateAsync(int id, UpdateCompetencyDto dto);

        Task<bool> DeleteAsync(int id);

        // Dashboard

        Task<CompetencyDashboardDto> GetDashboardAsync();

        // Role Competency Page

        Task<List<RoleCompetencyDto>> GetRoleCompetenciesAsync(int roleId);

    }

}
