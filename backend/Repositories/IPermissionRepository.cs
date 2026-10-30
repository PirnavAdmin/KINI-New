using TalentSphereAPI.DTOs.Permissions;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Interfaces
{
    public interface IPermissionRepository
    {
        Task<List<PermissionDto>> GetAllPermissionsAsync();

        Task<List<RolePermissionDto>> GetRolePermissionsAsync(
            UserRole role,
            int organizationId);

        Task<bool> UpdateRolePermissionsAsync(
            UserRole role,
            int organizationId,
            List<UpdateRolePermissionDto> permissions);

        Task<UserPermissionDto?> GetUserPermissionsAsync(
            int userId,
            int organizationId);
        Task<List<EmployeePermissionDto>> GetEmployeePermissionsAsync(
    int employeeId,
    int organizationId);

        Task<bool> UpdateEmployeePermissionsAsync(
            int employeeId,
            int organizationId,
            List<UpdateEmployeePermissionDto> permissions);

        Task<EmployeePermissionDto?> GetEmployeePermissionAsync(
            int employeeId,
            int permissionId,
            int organizationId);
    }
}