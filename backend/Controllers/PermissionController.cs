using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.Permissions;
using TalentSphereAPI.Interfaces;
using TalentSphereAPI.Models;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Services;
namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PermissionController : ControllerBase
    {
        private readonly IPermissionRepository _repository;
        private readonly INotificationService _notificationService;

        public PermissionController(
    IPermissionRepository repository,
    INotificationService notificationService)
        {
            _repository = repository;
            _notificationService = notificationService;
        }
        // ============================================================
        // GET ALL PERMISSION MODULES
        // ============================================================
        [Authorize(Roles = "OrganizationAdmin")]
        [HttpGet("modules")]
        public async Task<IActionResult> GetModules()
        {
            var permissions =
                await _repository.GetAllPermissionsAsync();

            return Ok(permissions);
        }

        // ============================================================
        // ROLE-BASED PERMISSIONS
        // ============================================================

        [Authorize(Roles = "OrganizationAdmin,Mentor,Employee,HR,HRRecruiter,HRExecutive,OperationAssociate")]
        [HttpGet("roles/{role}")]
        public async Task<IActionResult> GetRolePermissions(
    UserRole role)
        {
            var organizationId = GetOrganizationId();

            var currentRole =
                User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrWhiteSpace(currentRole))
            {
                return Unauthorized(new
                {
                    Success = false,
                    Message = "User role was not found in the authenticated token."
                });
            }

            // Organization Admin can view any role.
            if (!currentRole.Equals(
                    "OrganizationAdmin",
                    StringComparison.OrdinalIgnoreCase))
            {
                // Employee users can only read their own role permissions.
                if (!role.ToString().Equals(
                        currentRole,
                        StringComparison.OrdinalIgnoreCase))
                {
                    return Forbid();
                }
            }

            var permissions =
                await _repository.GetRolePermissionsAsync(
                    role,
                    organizationId);

            return Ok(permissions);
        }

        [Authorize(Roles = "OrganizationAdmin")]
        [HttpPut("roles/{role}")]
        public async Task<IActionResult> UpdateRolePermissions(
            UserRole role,
            [FromBody] List<UpdateRolePermissionDto> permissions)
        {
            var organizationId = GetOrganizationId();

            var result =
                await _repository.UpdateRolePermissionsAsync(
                    role,
                    organizationId,
                    permissions);

            if (!result)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Unable to update role permissions."
                });
            }

            return Ok(new
            {
                Success = true,
                Message = "Role permissions updated successfully."
            });
        }

        // ============================================================
        // EMPLOYEE-ID BASED PERMISSIONS
        // ============================================================

        // GET permissions for a specific Employee ID
        //
        // Example:
        // GET /api/Permission/employees/8
        //
        [HttpGet("employees/{employeeId:int}")]
        public async Task<IActionResult> GetEmployeePermissions(
            int employeeId)
        {
            var organizationId = GetOrganizationId();

            var permissions =
                await _repository.GetEmployeePermissionsAsync(
                    employeeId,
                    organizationId);

            // If employee doesn't belong to this organization,
            // repository returns an empty list.
            if (permissions.Count == 0)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = "Employee not found."
                });
            }

            return Ok(permissions);
        }

        // UPDATE permissions for a specific Employee ID
        //
        // Example:
        // PUT /api/Permission/employees/8
        //
        [HttpPut("employees/{employeeId:int}")]
        public async Task<IActionResult> UpdateEmployeePermissions(
            int employeeId,
            [FromBody] List<UpdateEmployeePermissionDto> permissions)
        {
            var organizationId = GetOrganizationId();

            try
            {
                var result =
                    await _repository.UpdateEmployeePermissionsAsync(
                        employeeId,
                        organizationId,
                        permissions);

                if (!result)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Employee not found."
                    });
                }

                // ============================================================
                // ORGANIZATION NOTIFICATION - PERMISSION CHANGED
                // ============================================================

                try
                {
                    await _notificationService
                        .CreateOrganizationNotificationAsync(
                            organizationId,
                            "Employee Permissions Changed",
                            $"Permissions for employee ID {employeeId} have been updated.",
                            NotificationType.PermissionChanged,
                            employeeId,
                            ReferenceType.Employee);
                }
                catch
                {
                    // Permission update is already completed.
                    // Notification failure must not undo the permission update.
                }

                return Ok(new
                {
                    Success = true,
                    Message =
                        "Employee permissions updated successfully."
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        // GET a specific employee/module permission
        //
        // Example:
        // GET /api/Permission/employees/8/modules/2
        //
        [HttpGet("employees/{employeeId:int}/modules/{permissionId:int}")]
        public async Task<IActionResult> GetEmployeePermission(
            int employeeId,
            int permissionId)
        {
            var organizationId = GetOrganizationId();

            var permission =
                await _repository.GetEmployeePermissionAsync(
                    employeeId,
                    permissionId,
                    organizationId);

            if (permission == null)
            {
                return NotFound(new
                {
                    Success = false,
                    Message =
                        "Employee or permission module not found."
                });
            }

            return Ok(permission);
        }

        // ============================================================
        // ORGANIZATION ID
        // ============================================================

        private int GetOrganizationId()
        {
            var organizationClaim =
                User.FindFirst("OrganizationId")?.Value;

            if (!int.TryParse(
                    organizationClaim,
                    out var organizationId) ||
                organizationId <= 0)
            {
                throw new UnauthorizedAccessException(
                    "OrganizationId was not found in the authenticated token.");
            }

            return organizationId;
        }
    }
}