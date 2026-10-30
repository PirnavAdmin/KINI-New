using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services;

/// <summary>
/// Resolves the employee belonging to the currently authenticated user.
/// Unlike EmployeeIdentityService, this is intentionally role-independent.
/// </summary>
public class EmployeeProfileIdentityService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ApplicationDbContext _context;

    public EmployeeProfileIdentityService(
        IHttpContextAccessor httpContextAccessor,
        ApplicationDbContext context)
    {
        _httpContextAccessor = httpContextAccessor;
        _context = context;
    }

    public async Task<Employee> GetCurrentEmployeeAsync()
    {
        var principal = _httpContextAccessor.HttpContext?.User;
        if (principal?.Identity?.IsAuthenticated != true)
            throw new UnauthorizedAccessException("User is not authenticated.");

        var userIdText = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdText, out var userId) || userId <= 0)
            throw new UnauthorizedAccessException("UserId was not found in the authenticated token.");

        var organizationText = principal.FindFirst("OrganizationId")?.Value;
        if (!int.TryParse(organizationText, out var organizationId) || organizationId <= 0)
            throw new UnauthorizedAccessException("OrganizationId was not found in the authenticated token.");

        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.OrganizationId == organizationId &&
                !x.IsDeleted);

        if (user == null)
            throw new UnauthorizedAccessException("Authenticated user was not found.");

        // Preferred link: Employee.UserId -> User.UserId.
        var employee = await _context.Employees
            .FirstOrDefaultAsync(x =>
                x.OrganizationId == organizationId &&
                x.UserId == userId &&
                !x.IsDeleted);

        // Backward-compatible fallback for employees created before UserId linking.
        if (employee == null && !string.IsNullOrWhiteSpace(user.Email))
        {
            employee = await _context.Employees
                .FirstOrDefaultAsync(x =>
                    x.OrganizationId == organizationId &&
                    x.Email == user.Email &&
                    !x.IsDeleted);
        }

        if (employee == null)
            throw new UnauthorizedAccessException(
                "The authenticated user is not linked to an employee profile.");

        return employee;
    }
}

