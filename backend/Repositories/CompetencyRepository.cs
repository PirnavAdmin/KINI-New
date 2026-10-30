using Microsoft.EntityFrameworkCore;

using TalentSphereAPI.Data;

using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories

{

    public class CompetencyRepository : ICompetencyRepository

    {

        private readonly ApplicationDbContext _context;

        public CompetencyRepository(ApplicationDbContext context)

        {

            _context = context;

        }

        public async Task<IEnumerable<Competency>> GetAllAsync()

        {

            return await _context.Competencies.ToListAsync();

        }

        public async Task<Competency?> GetByIdAsync(int id)

        {

            return await _context.Competencies

                .FirstOrDefaultAsync(x => x.CompetencyId == id);

        }

        public async Task AddAsync(Competency competency)

        {

            await _context.Competencies.AddAsync(competency);

        }

        public void Update(Competency competency)

        {

            _context.Competencies.Update(competency);

        }

        public void Delete(Competency competency)

        {

            _context.Competencies.Remove(competency);

        }

        public async Task SaveAsync()

        {

            await _context.SaveChangesAsync();

        }

        // Dashboard Methods

        public async Task<int> GetCompetencyCountAsync()

        {

            return await _context.Competencies.CountAsync();

        }

        public async Task<int> GetRoleCountAsync()

        {

            return await _context.Roles.CountAsync();

        }

        public async Task<int> GetRoleCompetencyCountAsync()

        {

            return await _context.RoleCompetencies.CountAsync();

        }

        // Role Competency Page

        public async Task<List<RoleCompetency>> GetRoleCompetenciesAsync(int roleId)

        {

            return await _context.RoleCompetencies

                .Include(rc => rc.Role)

                .Include(rc => rc.Competency)

                .Where(rc => rc.RoleId == roleId)

                .ToListAsync();

        }

    }

}
