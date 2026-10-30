using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Permissions;
using TalentSphereAPI.Interfaces;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories
{
    public class PermissionRepository : IPermissionRepository
    {
        private readonly ApplicationDbContext _context;

        public PermissionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // ============================================================
        // GET ALL MODULES
        // ============================================================

        public async Task<List<PermissionDto>> GetAllPermissionsAsync()
        {
            return await _context.Permissions
                .AsNoTracking()
                .Where(x => x.IsActive)
                .OrderBy(x => x.PermissionId)
                .Select(x => new PermissionDto
                {
                    PermissionId = x.PermissionId,
                    Module = x.Module,

                    CanView = false,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = false
                })
                .ToListAsync();
        }

        // ============================================================
        // GET ROLE PERMISSIONS FOR ORGANIZATION
        // ============================================================

        public async Task<List<RolePermissionDto>> GetRolePermissionsAsync(
            UserRole role,
            int organizationId)
        {
            var permissions = await _context.Permissions
                .AsNoTracking()
                .Where(x => x.IsActive)
                .OrderBy(x => x.PermissionId)
                .ToListAsync();

            // First try organization-specific permissions.
            var organizationPermissions =
                await _context.RolePermissions
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId == organizationId &&
                        x.Role == role)
                    .ToListAsync();

            // Platform defaults are only used if there is no
            // organization-specific permission for that module.
            var defaultPermissions =
                await _context.RolePermissions
                    .AsNoTracking()
                    .Where(x =>
                        x.OrganizationId == null &&
                        x.Role == role)
                    .ToListAsync();

            return permissions.Select(permission =>
            {
                var organizationPermission =
                    organizationPermissions.FirstOrDefault(
                        x => x.PermissionId == permission.PermissionId);

                var defaultPermission =
                    defaultPermissions.FirstOrDefault(
                        x => x.PermissionId == permission.PermissionId);

                // Organization permission ALWAYS wins.
                // If an organization has explicitly configured
                // the module, even false values are respected.
                var effective =
                    organizationPermission
                    ?? defaultPermission;

                return new RolePermissionDto
                {
                    PermissionId =
                        permission.PermissionId,

                    Module =
                        permission.Module,

                    Role =
                        role,

                    OrganizationId =
                        organizationId,

                    CanView =
                        effective?.CanView ?? false,

                    CanAdd =
                        effective?.CanAdd ?? false,

                    CanEdit =
                        effective?.CanEdit ?? false,

                    CanDelete =
                        effective?.CanDelete ?? false,

                    CanAccess =
                        effective?.CanAccess ?? false
                };
            }).ToList();
        }

        // ============================================================
        // UPDATE ROLE PERMISSIONS
        // ============================================================
        //
        // IMPORTANT:
        // Every active module gets an organization-specific record.
        //
        // If frontend does NOT send a module:
        //     View = false
        //     Add = false
        //     Edit = false
        //     Delete = false
        //     Access = false
        //
        // Therefore the platform/default permission can NEVER
        // accidentally give access after organization configuration.
        //
        // ============================================================

        public async Task<bool> UpdateRolePermissionsAsync(
            UserRole role,
            int organizationId,
            List<UpdateRolePermissionDto> permissions)
        {
            if (organizationId <= 0)
            {
                throw new ArgumentException(
                    "A valid organizationId is required.");
            }

            if (!IsEmployeeRole(role))
            {
               
throw new ArgumentException(
    "Only employee roles can be configured.");


            }

            permissions ??=
                new List<UpdateRolePermissionDto>();

            // ========================================================
            // 1. Get all active modules
            // ========================================================

            var activePermissions =
                await _context.Permissions
                    .Where(x => x.IsActive)
                    .OrderBy(x => x.PermissionId)
                    .ToListAsync();

            // ========================================================
            // 2. Validate duplicate PermissionIds
            // ========================================================

            var duplicateIds =
                permissions
                    .GroupBy(x => x.PermissionId)
                    .Where(g => g.Count() > 1)
                    .Select(g => g.Key)
                    .ToList();

            if (duplicateIds.Count > 0)
            {
                throw new ArgumentException(
                    $"Duplicate PermissionId values are not allowed: {string.Join(", ", duplicateIds)}.");
            }

            // ========================================================
            // 3. Validate PermissionIds
            // ========================================================

            var activePermissionIds =
                activePermissions
                    .Select(x => x.PermissionId)
                    .ToHashSet();

            var invalidIds =
                permissions
                    .Select(x => x.PermissionId)
                    .Where(id => !activePermissionIds.Contains(id))
                    .Distinct()
                    .ToList();

            if (invalidIds.Count > 0)
            {
                throw new KeyNotFoundException(
                    $"Permission module(s) not found or inactive: {string.Join(", ", invalidIds)}.");
            }

            // ========================================================
            // 4. Get existing organization role permissions
            // ========================================================

            var existing =
                await _context.RolePermissions
                    .Where(x =>
                        x.OrganizationId == organizationId &&
                        x.Role == role)
                    .ToListAsync();

            // ========================================================
            // 5. IMPORTANT
            //
            // Every active module gets a row.
            //
            // Missing frontend module = ALL FALSE.
            // ========================================================

            foreach (var permission in activePermissions)
            {
                var dto =
                    permissions.FirstOrDefault(
                        x => x.PermissionId == permission.PermissionId);

                var entity =
                    existing.FirstOrDefault(
                        x => x.PermissionId == permission.PermissionId);

                if (entity == null)
                {
                    entity = new RolePermission
                    {
                        OrganizationId =
                            organizationId,

                        Role =
                            role,

                        PermissionId =
                            permission.PermissionId
                    };

                    _context.RolePermissions.Add(entity);
                }

                // If frontend didn't send this module,
                // explicitly deny everything.
                entity.CanView =
                    dto?.CanView ?? false;

                entity.CanAdd =
                    dto?.CanAdd ?? false;

                entity.CanEdit =
                    dto?.CanEdit ?? false;

                entity.CanDelete =
                    dto?.CanDelete ?? false;

                entity.CanAccess =
                    dto?.CanAccess ?? false;
            }

            await _context.SaveChangesAsync();

            return true;
        }

        // ============================================================
        // GET EFFECTIVE USER PERMISSIONS
        // ============================================================
        //
        // READ ONLY.
        //
        // Employee permissions come from:
        //
        // User -> Role -> Organization RolePermission
        //
        // ============================================================

        public async Task<UserPermissionDto?> GetUserPermissionsAsync(
            int userId,
            int organizationId)
        {
            var user =
                await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x =>
                        x.UserId == userId &&
                        x.OrganizationId == organizationId &&
                        !x.IsDeleted);

            if (user == null)
            {
                return null;
            }

            var rolePermissions =
                await GetRolePermissionsAsync(
                    user.Role,
                    organizationId);

            return new UserPermissionDto
            {
                UserId =
                    user.UserId,

                UserName =
                    $"{user.FirstName} {user.LastName}".Trim(),

                Email =
                    user.Email,

                Role =
                    user.Role.ToString(),

                Permissions =
                    rolePermissions
                        .Select(x => new PermissionDto
                        {
                            PermissionId =
                                x.PermissionId,

                            Module =
                                x.Module,

                            CanView =
                                x.CanView,

                            CanAdd =
                                x.CanAdd,

                            CanEdit =
                                x.CanEdit,

                            CanDelete =
                                x.CanDelete,

                            CanAccess =
                                x.CanAccess
                        })
                        .ToList()
            };
        }

        // ============================================================
        // VALID EMPLOYEE ROLES
        // ============================================================

       
private static bool IsEmployeeRole(
    UserRole role)
        {
            return role is
                UserRole.Employee
                or UserRole.Mentor
                or UserRole.HR
                or UserRole.HRRecruiter
                or UserRole.HRExecutive
                or UserRole.OperationAssociate;
        }


        public async Task<List<EmployeePermissionDto>> GetEmployeePermissionsAsync(
    int employeeId,
    int organizationId)
        {
            // Make sure the employee belongs to the organization.
            var employeeExists = await _context.Employees
                .AnyAsync(e =>
                    e.EmployeeId == employeeId &&
                    e.OrganizationId == organizationId &&
                    !e.IsDeleted);

            if (!employeeExists)
            {
                return new List<EmployeePermissionDto>();
            }

            var permissions = await _context.Permissions
                .Where(p => p.IsActive)
                .OrderBy(p => p.PermissionId)
                .ToListAsync();

            var employeePermissions = await _context.EmployeePermissions
                .Where(ep =>
                    ep.EmployeeId == employeeId) 
                .ToListAsync();

            return permissions.Select(permission =>
            {
                var employeePermission = employeePermissions
                    .FirstOrDefault(ep =>
                        ep.PermissionId == permission.PermissionId);

                return new EmployeePermissionDto
                {
                    EmployeeId = employeeId,
                    PermissionId = permission.PermissionId,
                    Module = permission.Module,

                    CanView = employeePermission?.CanView ?? false,
                    CanAdd = employeePermission?.CanAdd ?? false,
                    CanEdit = employeePermission?.CanEdit ?? false,
                    CanDelete = employeePermission?.CanDelete ?? false,
                    CanAccess = employeePermission?.CanAccess ?? false
                };
            }).ToList();
        }
        public async Task<bool> UpdateEmployeePermissionsAsync(
    int employeeId,
    int organizationId,
    List<UpdateEmployeePermissionDto> permissions)
        {
            // Verify employee belongs to the logged-in organization.
            var employee = await _context.Employees
                .FirstOrDefaultAsync(e =>
                    e.EmployeeId == employeeId &&
                    e.OrganizationId == organizationId &&
                    !e.IsDeleted);

            if (employee == null)
            {
                return false;
            }

            var allPermissions = await _context.Permissions
                .Where(p => p.IsActive)
                .ToListAsync();

            // Validate permission IDs.
            var validPermissionIds = allPermissions
                .Select(p => p.PermissionId)
                .ToHashSet();

            var requestedPermissionIds = permissions
                .Select(p => p.PermissionId)
                .ToList();

            if (requestedPermissionIds.Count !=
                requestedPermissionIds.Distinct().Count())
            {
                throw new ArgumentException(
                    "Duplicate PermissionId values are not allowed.");
            }

            if (requestedPermissionIds.Any(id => !validPermissionIds.Contains(id)))
            {
                throw new ArgumentException(
                    "One or more PermissionId values are invalid.");
            }

            var existingPermissions = await _context.EmployeePermissions
                .Where(ep => ep.EmployeeId == employeeId)
                .ToListAsync();

            // IMPORTANT:
            // Create/update a row for EVERY active module.
            //
            // If the frontend doesn't send a module,
            // it becomes FALSE rather than falling back to role permissions.
            foreach (var permission in allPermissions)
            {
                var requested = permissions.FirstOrDefault(p =>
                    p.PermissionId == permission.PermissionId);

                var existing = existingPermissions.FirstOrDefault(ep =>
                    ep.PermissionId == permission.PermissionId);

                if (existing == null)
                {
                    existing = new EmployeePermission
                    {
                        EmployeeId = employeeId,
                        PermissionId = permission.PermissionId
                    };

                    _context.EmployeePermissions.Add(existing);
                }

                existing.CanView = requested?.CanView ?? false;
                existing.CanAdd = requested?.CanAdd ?? false;
                existing.CanEdit = requested?.CanEdit ?? false;
                existing.CanDelete = requested?.CanDelete ?? false;
                existing.CanAccess = requested?.CanAccess ?? false;
            }

            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<EmployeePermissionDto?> GetEmployeePermissionAsync(
    int employeeId,
    int permissionId,
    int organizationId)
        {
            var employeeExists = await _context.Employees
                .AnyAsync(e =>
                    e.EmployeeId == employeeId &&
                    e.OrganizationId == organizationId &&
                    !e.IsDeleted);

            if (!employeeExists)
            {
                return null;
            }

            var permission = await _context.Permissions
                .FirstOrDefaultAsync(p =>
                    p.PermissionId == permissionId &&
                    p.IsActive);

            if (permission == null)
            {
                return null;
            }

            var employeePermission = await _context.EmployeePermissions
                .FirstOrDefaultAsync(ep =>
                    ep.EmployeeId == employeeId &&
                    ep.PermissionId == permissionId);

            if (employeePermission == null)
            {
                return new EmployeePermissionDto
                {
                    EmployeeId = employeeId,
                    PermissionId = permissionId,
                    Module = permission.Module,
                    CanView = false,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = false
                };
            }

            return new EmployeePermissionDto
            {
                EmployeeId = employeeId,
                PermissionId = permissionId,
                Module = permission.Module,

                CanView = employeePermission.CanView,
                CanAdd = employeePermission.CanAdd,
                CanEdit = employeePermission.CanEdit,
                CanDelete = employeePermission.CanDelete,
                CanAccess = employeePermission.CanAccess
            };
        }
    }
}