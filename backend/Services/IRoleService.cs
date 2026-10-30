using TalentSphereAPI.DTOs.Role;

namespace TalentSphereAPI.Services

{

    public interface IRoleService

    {

        Task<IEnumerable<RoleResponseDto>> GetAllAsync();

        Task<RoleResponseDto?> GetByIdAsync(int id);

        Task CreateAsync(CreateRoleDto dto);

        Task<bool> UpdateAsync(int id, UpdateRoleDto dto);

        Task<bool> DeleteAsync(int id);

    }

}
