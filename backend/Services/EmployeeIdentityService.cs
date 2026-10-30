
﻿using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services
{
    public class EmployeeIdentityService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ApplicationDbContext _context;

        public EmployeeIdentityService(
            IHttpContextAccessor httpContextAccessor,
            ApplicationDbContext context)
        {
            _httpContextAccessor = httpContextAccessor;
            _context = context;
        }

        public async Task<Employee> GetCurrentEmployeeAsync()
        {
            var user =
                _httpContextAccessor
                    .HttpContext?.User;

            // ==========================================
            // 1. AUTHENTICATION
            // ==========================================

            if (user?.Identity?.IsAuthenticated != true)
            {
                throw new UnauthorizedAccessException(
                    "User is not authenticated.");
            }

            // ==========================================
            // 2. USER ID
            // ==========================================

            var userIdClaim =
                user.FindFirst(
                    ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(
                    userIdClaim,
                    out var userId))
            {
                throw new UnauthorizedAccessException(
                    "UserId was not found in the authenticated token.");
            }

            // ==========================================
            // 3. ORGANIZATION ID
            // ==========================================

            var organizationClaim =
                user.FindFirst(
                    "OrganizationId")?.Value;

            if (!int.TryParse(
                    organizationClaim,
                    out var organizationId))
            {
                throw new UnauthorizedAccessException(
                    "OrganizationId was not found in the authenticated token.");
            }

            // ==========================================
            // 4. FIND USER
            // ==========================================

            var loggedInUser =
                await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x =>
                        x.UserId == userId &&
                        x.OrganizationId ==
                            organizationId &&
                        !x.IsDeleted);

            if (loggedInUser == null)
            {
                throw new UnauthorizedAccessException(
                    "Authenticated user was not found.");
            }

            // ==========================================
            // 5. ROLE
            // ==========================================

            var roleClaim =
                user.FindFirst(
                    ClaimTypes.Role)?.Value;

            // ==========================================
            // 6. ALL NORMAL EMPLOYEE ROLES
            // ==========================================

            var employeeRoles =
                new[]
                {
                    UserRole.Employee.ToString(),
                    UserRole.Mentor.ToString(),
                    UserRole.HR.ToString(),
                    UserRole.HRRecruiter.ToString(),
                    UserRole.HRExecutive.ToString(),
                    UserRole.OperationAssociate.ToString()
                };

            var isEmployeeRole =
                employeeRoles.Any(role =>
                    string.Equals(
                        role,
                        roleClaim,
                        StringComparison.OrdinalIgnoreCase));

            if (isEmployeeRole)
            {
                // ======================================
                // FIND LINKED EMPLOYEE
                // ======================================

                var employee =
                    await _context.Employees
                        .FirstOrDefaultAsync(x =>
                            x.UserId == userId &&
                            x.OrganizationId ==
                                organizationId &&
                            !x.IsDeleted);

                if (employee == null)
                {
                    throw new UnauthorizedAccessException(
                        "The authenticated user is not linked to an employee.");
                }

                return employee;
            }

            // ==========================================
            // INVALID ROLE
            // ==========================================

            throw new UnauthorizedAccessException(
                "Only employee users can access employee functionality.");
        }
    }
}
