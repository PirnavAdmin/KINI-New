using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories

{

    public interface IRoleRepository

    {

        Task<IEnumerable<Role>> GetAllAsync();

        Task<Role?> GetByIdAsync(int id);

        Task AddAsync(Role role);

        void Update(Role role);

        void Delete(Role role);

        Task SaveAsync();

    }

}
