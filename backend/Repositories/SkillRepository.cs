using Microsoft.EntityFrameworkCore;

using TalentSphereAPI.Data;

using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories

{

    public class SkillRepository : ISkillRepository

    {

        private readonly ApplicationDbContext _context;

        public SkillRepository(ApplicationDbContext context)

        {

            _context = context;

        }

        public async Task<IEnumerable<Skill>> GetAllAsync()

        {

            return await _context.Skills.ToListAsync();

        }

        public async Task<Skill?> GetByIdAsync(int id)

        {

            return await _context.Skills

                .FirstOrDefaultAsync(x => x.SkillId == id);

        }

        public async Task AddAsync(Skill skill)

        {

            await _context.Skills.AddAsync(skill);

        }

        public void Update(Skill skill)

        {

            _context.Skills.Update(skill);

        }

        public void Delete(Skill skill)

        {

            _context.Skills.Remove(skill);

        }

        public async Task SaveAsync()

        {

            await _context.SaveChangesAsync();

        }

    }

}
