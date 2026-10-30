using Microsoft.EntityFrameworkCore;

using TalentSphereAPI.Data;

using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories

{

    public class RoleCompetencyRepository : IRoleCompetencyRepository

    {

        private readonly ApplicationDbContext _context;

        public RoleCompetencyRepository(

            ApplicationDbContext context)

        {

            _context = context;

        }

        public async Task<IEnumerable<RoleCompetency>> GetAllAsync()

        {

            return await _context.RoleCompetencies

                .Include(x => x.Role)

                .Include(x => x.Competency)

                .ToListAsync();

        }

        public async Task<RoleCompetency?> GetByIdAsync(int id)

        {

            return await _context.RoleCompetencies

                .Include(x => x.Role)

                .Include(x => x.Competency)

                .FirstOrDefaultAsync(x => x.RoleCompetencyId == id);

        }

        public async Task AddAsync(RoleCompetency roleCompetency)

        {

            await _context.RoleCompetencies.AddAsync(roleCompetency);

        }

        public void Update(RoleCompetency roleCompetency)

        {

            _context.RoleCompetencies.Update(roleCompetency);

        }

        public void Delete(RoleCompetency roleCompetency)

        {

            _context.RoleCompetencies.Remove(roleCompetency);

        }

        public async Task SaveAsync()

        {

            await _context.SaveChangesAsync();

        }

    }

}
