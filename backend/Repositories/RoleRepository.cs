using Microsoft.EntityFrameworkCore;

using TalentSphereAPI.Data;

using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories

{

    public class RoleRepository : IRoleRepository

    {

        private readonly ApplicationDbContext _context;

        public RoleRepository(ApplicationDbContext context)

        {

            _context = context;

        }

        public async Task<IEnumerable<Role>> GetAllAsync()

        {

            return await _context.Roles.ToListAsync();

        }

        public async Task<Role?> GetByIdAsync(int id)

        {

            return await _context.Roles

                .FirstOrDefaultAsync(r => r.RoleId == id);

        }

        public async Task AddAsync(Role role)

        {

            await _context.Roles.AddAsync(role);

        }

        public void Update(Role role)

        {

            _context.Roles.Update(role);

        }

        public void Delete(Role role)

        {

            _context.Roles.Remove(role);

        }

        public async Task SaveAsync()

        {

            await _context.SaveChangesAsync();

        }

    }

}
