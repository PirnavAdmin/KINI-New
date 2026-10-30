using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories
{
    public class OrganizationRepository : IOrganizationRepository
    {
        private readonly ApplicationDbContext _context;

        public OrganizationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateAsync(Organization organization)
        {
            await _context.Organizations.AddAsync(organization);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<List<Organization>> GetAllAsync()
        {
            return await _context.Organizations.ToListAsync();
        }

        public async Task<Organization?> GetByIdAsync(int organizationId)
        {
            return await _context.Organizations
                .FirstOrDefaultAsync(x =>
                    x.OrganizationId == organizationId);
        }

        public async Task<Organization?> GetByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return null;

            email = email.Trim();

            return await _context.Organizations
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Email == email);
        }
        // ==========================================
        // GOOGLE LOGIN
        // ==========================================

        public async Task<Organization?> GetByGoogleSubjectIdAsync(
     string googleSubjectId)
        {
            if (string.IsNullOrWhiteSpace(googleSubjectId))
                return null;

            return await _context.Organizations
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.GoogleSubjectId == googleSubjectId);
        }

        public async Task<bool> UpdateAsync(Organization organization)
        {
            _context.Organizations.Update(organization);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int organizationId)
        {
            var organization =
                await _context.Organizations
                    .FirstOrDefaultAsync(x =>
                        x.OrganizationId == organizationId);

            if (organization == null)
                return false;

            _context.Organizations.Remove(organization);

            return await _context.SaveChangesAsync() > 0;
        }
    }
}