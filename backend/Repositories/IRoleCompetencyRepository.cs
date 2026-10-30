using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories

{

    public interface IRoleCompetencyRepository

    {

        Task<IEnumerable<RoleCompetency>> GetAllAsync();

        Task<RoleCompetency?> GetByIdAsync(int id);

        Task AddAsync(RoleCompetency roleCompetency);

        void Update(RoleCompetency roleCompetency);

        void Delete(RoleCompetency roleCompetency);

        Task SaveAsync();

    }

}
