using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Services.Tenancy;
using TalentSphereAPI.Data;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories
{
    public class BranchRepository : IBranchRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ITenantContext _tenantContext;

        public BranchRepository(
            ApplicationDbContext context,
            ITenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        private int OrganizationId =>
            _tenantContext.OrganizationId;

        public async Task<bool> CreateAsync(Branch branch)
        {
            branch.OrganizationId = OrganizationId;

            _context.Branches.Add(branch);

            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<IEnumerable<Branch>> GetAllAsync()
        {
            return await _context.Branches
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId == OrganizationId)
                .Include(x => x.Departments)
                .OrderBy(x => x.BranchName)
                .ToListAsync();
        }
        public async Task<Branch?> GetByIdAsync(int branchId)
        {
            return await _context.Branches
                .AsNoTracking()
                .Include(x => x.Departments)
                .FirstOrDefaultAsync(x =>
                    x.BranchId == branchId &&
                    x.OrganizationId == OrganizationId);
        }

        public async Task<bool> UpdateAsync(Branch branch)
        {
            var existing =
                await _context.Branches.FirstOrDefaultAsync(x =>
                    x.BranchId == branch.BranchId &&
                    x.OrganizationId == OrganizationId);

            if (existing == null)
                return false;

            existing.BranchName = branch.BranchName;
            existing.Location = branch.Location;
            existing.Description = branch.Description;
            existing.Status = branch.Status;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int branchId)
        {
            var branch =
                await _context.Branches.FirstOrDefaultAsync(x =>
                    x.BranchId == branchId &&
                    x.OrganizationId == OrganizationId);

            if (branch == null)
                return false;

            branch.Status = false;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}