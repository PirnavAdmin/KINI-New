using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TalentSphereAPI.Data;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Authorization
{
    public class PermissionAuthorizationHandler
        : AuthorizationHandler<PermissionRequirement>
    {
        private readonly ApplicationDbContext _context;

        public PermissionAuthorizationHandler(
            ApplicationDbContext context)
        {
            _context = context;
        }

        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            PermissionRequirement requirement)
        {
            // ============================================================
            // 1. USER MUST BE AUTHENTICATED
            // ============================================================

            if (context.User.Identity?.IsAuthenticated != true)
            {
                return;
            }

            // ============================================================
            // 2. GET ROLE FROM JWT
            // ============================================================

            var roleClaim =
                context.User.FindFirst(ClaimTypes.Role)?.Value;

            // ============================================================
            // 3. ORGANIZATION ADMIN
            //
            // Keep existing OrganizationAdmin bypass.
            // ============================================================

            if (string.Equals(
                    roleClaim,
                    "OrganizationAdmin",
                    StringComparison.OrdinalIgnoreCase))
            {
                context.Succeed(requirement);
                return;
            }

            // ============================================================
            // 4. GET USER ID FROM JWT
            // ============================================================

            var userIdValue =
                context.User.FindFirst(
                    ClaimTypes.NameIdentifier)?.Value
                ?? context.User.FindFirst("sub")?.Value
                ?? context.User.FindFirst("UserId")?.Value;

            if (!int.TryParse(
                    userIdValue,
                    out var userId))
            {
                return;
            }

            // ============================================================
            // 5. LOAD USER
            // ============================================================

            var user =
                await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u =>
                        u.UserId == userId &&
                        !u.IsDeleted);

            if (user == null)
            {
                return;
            }

            // ============================================================
            // 6. SUPER ADMIN
            // ============================================================

            if (user.Role == UserRole.SuperAdmin)
            {
                context.Succeed(requirement);
                return;
            }

            // ============================================================
            // 7. USER MUST BELONG TO AN ORGANIZATION
            // ============================================================

            if (!user.OrganizationId.HasValue ||
                user.OrganizationId.Value <= 0)
            {
                return;
            }

            var organizationId =
                user.OrganizationId.Value;

            // ============================================================
            // 8. FIND PERMISSION MODULE
            // ============================================================

            var permission =
                await _context.Permissions
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p =>
                        p.Module == requirement.Module &&
                        p.IsActive);

            if (permission == null)
            {
                return;
            }

            // ============================================================
            // 9. ORGANIZATION ROLE
            //
            // Organization users do NOT need to exist in Employees.
            //
            // First check organization-specific role permission.
            // Then check global role permission.
            // ============================================================

            if (user.Role == UserRole.Organization)
            {
                var organizationRolePermission =
                    await _context.RolePermissions
                        .AsNoTracking()
                        .FirstOrDefaultAsync(rp =>
                            rp.OrganizationId == organizationId &&
                            rp.Role == UserRole.Organization &&
                            rp.PermissionId ==
                                permission.PermissionId);

                if (organizationRolePermission != null)
                {
                    if (CheckPermission(
                            organizationRolePermission,
                            requirement.Action))
                    {
                        context.Succeed(requirement);
                    }

                    return;
                }

                // --------------------------------------------------------
                // GLOBAL ORGANIZATION ROLE PERMISSION
                // --------------------------------------------------------

                var globalOrganizationPermission =
                    await _context.RolePermissions
                        .AsNoTracking()
                        .FirstOrDefaultAsync(rp =>
                            rp.OrganizationId == null &&
                            rp.Role == UserRole.Organization &&
                            rp.PermissionId ==
                                permission.PermissionId);

                if (globalOrganizationPermission != null)
                {
                    if (CheckPermission(
                            globalOrganizationPermission,
                            requirement.Action))
                    {
                        context.Succeed(requirement);
                    }
                }

                return;
            }

            // ============================================================
            // 10. OTHER ORGANIZATION USERS
            //
            // Employee / HR / Mentor / etc.
            // ============================================================

            var employee =
                await _context.Employees
                    .AsNoTracking()
                    .FirstOrDefaultAsync(e =>
                        e.UserId == user.UserId &&
                        e.OrganizationId == organizationId &&
                        !e.IsDeleted);

            if (employee == null)
            {
                return;
            }

            // ============================================================
            // 11. EMPLOYEE-SPECIFIC PERMISSION
            //
            // Highest priority.
            // ============================================================

            var employeePermission =
                await _context.EmployeePermissions
                    .AsNoTracking()
                    .FirstOrDefaultAsync(ep =>
                        ep.EmployeeId ==
                            employee.EmployeeId &&
                        ep.PermissionId ==
                            permission.PermissionId);

            if (employeePermission != null)
            {
                var allowed =
                    CheckPermission(
                        employeePermission,
                        requirement.Action);

                if (allowed)
                {
                    context.Succeed(requirement);
                }

                return;
            }

            // ============================================================
            // 12. ORGANIZATION-SPECIFIC ROLE PERMISSION
            // ============================================================

            var rolePermission =
                await _context.RolePermissions
                    .AsNoTracking()
                    .FirstOrDefaultAsync(rp =>
                        rp.OrganizationId == organizationId &&
                        rp.Role == user.Role &&
                        rp.PermissionId ==
                            permission.PermissionId);

            if (rolePermission != null)
            {
                var allowed =
                    CheckPermission(
                        rolePermission,
                        requirement.Action);

                if (allowed)
                {
                    context.Succeed(requirement);
                }

                return;
            }

            // ============================================================
            // 13. GLOBAL ROLE DEFAULT
            // ============================================================

            var globalRolePermission =
                await _context.RolePermissions
                    .AsNoTracking()
                    .FirstOrDefaultAsync(rp =>
                        rp.OrganizationId == null &&
                        rp.Role == user.Role &&
                        rp.PermissionId ==
                            permission.PermissionId);

            if (globalRolePermission != null)
            {
                var allowed =
                    CheckPermission(
                        globalRolePermission,
                        requirement.Action);

                if (allowed)
                {
                    context.Succeed(requirement);
                }
            }
        }

        // ================================================================
        // ROLE PERMISSION
        // ================================================================

        private static bool CheckPermission(
            RolePermission permission,
            string action)
        {
            // CanAccess is the master switch.
            if (!permission.CanAccess)
            {
                return false;
            }

            return action.ToLowerInvariant() switch
            {
                "view" =>
                    permission.CanView,

                "add" =>
                    permission.CanAdd,

                "edit" =>
                    permission.CanEdit,

                "delete" =>
                    permission.CanDelete,

                "access" =>
                    permission.CanAccess,

                _ => false
            };
        }

        // ================================================================
        // EMPLOYEE PERMISSION
        // ================================================================

        private static bool CheckPermission(
            EmployeePermission permission,
            string action)
        {
            // CanAccess is the master switch.
            if (!permission.CanAccess)
            {
                return false;
            }

            return action.ToLowerInvariant() switch
            {
                "view" =>
                    permission.CanView,

                "add" =>
                    permission.CanAdd,

                "edit" =>
                    permission.CanEdit,

                "delete" =>
                    permission.CanDelete,

                "access" =>
                    permission.CanAccess,

                _ => false
            };
        }
    }
}