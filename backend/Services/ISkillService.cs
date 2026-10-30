using TalentSphereAPI.DTOs;

namespace TalentSphereAPI.Services

{

    public interface ISkillService

    {

        Task<IEnumerable<SkillResponseDto>> GetAllAsync();

        Task<SkillResponseDto?> GetByIdAsync(int id);

        Task CreateAsync(CreateSkillDto dto);

        Task<bool> UpdateAsync(int id, UpdateSkillDto dto);

        Task<bool> DeleteAsync(int id);

    }

}
