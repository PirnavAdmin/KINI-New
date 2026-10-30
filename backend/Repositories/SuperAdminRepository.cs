using Microsoft.EntityFrameworkCore;

using TalentSphereAPI.Data;

using TalentSphereAPI.Models;

using TalentSphereAPI.Repositories.Interfaces;

namespace TalentSphereAPI.Repositories

{

    public class SuperAdminRepository : ISuperAdminRepository

    {

        private readonly ApplicationDbContext _context;

        public SuperAdminRepository(ApplicationDbContext context)

        {

            _context = context;

        }

        public async Task<SuperAdmin?> GetByEmailAsync(string email)

        {

            return await _context.SuperAdmins

                .FirstOrDefaultAsync(x => x.Email == email);

        }

    }

}
