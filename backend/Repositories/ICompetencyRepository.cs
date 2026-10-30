using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories

{

    public interface ICompetencyRepository

    {

        Task<IEnumerable<Competency>> GetAllAsync();

        Task<Competency?> GetByIdAsync(int id);

        Task AddAsync(Competency competency);

        void Update(Competency competency);

        void Delete(Competency competency);

        Task SaveAsync();

        Task<int> GetCompetencyCountAsync();

        Task<int> GetRoleCountAsync();

        Task<int> GetRoleCompetencyCountAsync();

        Task<List<RoleCompetency>> GetRoleCompetenciesAsync(int roleId);

    }

}
