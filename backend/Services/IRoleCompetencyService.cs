using TalentSphereAPI.DTOs;

namespace TalentSphereAPI.Services

{

    public interface IRoleCompetencyService

    {

        Task<IEnumerable<RoleCompetencyDto>> GetAllAsync();

        Task<RoleCompetencyDto?> GetByIdAsync(int id);

        Task CreateAsync(CreateRoleCompetencyDto dto);

        Task<bool> UpdateAsync(

            int id,

            UpdateRoleCompetencyDto dto);

        Task<bool> DeleteAsync(int id);

    }

}
