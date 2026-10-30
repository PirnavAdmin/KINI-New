using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories

{

    public interface ISkillRepository

    {

        Task<IEnumerable<Skill>> GetAllAsync();

        Task<Skill?> GetByIdAsync(int id);

        Task AddAsync(Skill skill);

        void Update(Skill skill);

        void Delete(Skill skill);

        Task SaveAsync();

    }

}
