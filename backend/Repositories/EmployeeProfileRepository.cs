using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.Models.EmployeeProfile;

namespace TalentSphereAPI.Repositories;

public class EmployeeProfileRepository : IEmployeeProfileRepository
{
    private readonly ApplicationDbContext _context;

    public EmployeeProfileRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public Task<EmployeeProfile?> GetAsync(int organizationId, int employeeId)
    {
        return _context.EmployeeProfiles
            .Include(x => x.Department)
            .Include(x => x.Educations)
            .Include(x => x.Experiences)
            .Include(x => x.Documents)
            .FirstOrDefaultAsync(x =>
                x.OrganizationId == organizationId &&
                x.EmployeeId == employeeId &&
                !x.IsDeleted);
    }

    public async Task<EmployeeProfile> GetOrCreateAsync(int organizationId, Employee employee)
    {
        var profile = await GetAsync(organizationId, employee.EmployeeId);
        if (profile != null)
            return profile;

        profile = new EmployeeProfile
        {
            OrganizationId = organizationId,
            EmployeeId = employee.EmployeeId,
            EmployeeCode = $"P{employee.EmployeeId}",
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };

        _context.EmployeeProfiles.Add(profile);
        await _context.SaveChangesAsync();
        return await GetAsync(organizationId, employee.EmployeeId)
            ?? throw new InvalidOperationException("Employee profile could not be created.");
    }

    public async Task SaveAsync(EmployeeProfile profile)
    {
        profile.UpdatedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }
}
