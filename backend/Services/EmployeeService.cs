
﻿using System.Linq;
using TalentSphereAPI.DTOs.Employee;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Helpers;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories;
using TalentSphereAPI.Services.Interfaces;
using Google.Apis.Auth;
using TalentSphereAPI.DTOs;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _repository;
        private readonly IEmailService _emailService;
        private readonly INotificationService _notificationService;
        private readonly IJwtService _jwtService;
        private readonly IAuthRepository _authRepository;
        private readonly IConfiguration _configuration;
        public EmployeeService(
    IEmployeeRepository repository,
    IEmailService emailService,
    INotificationService notificationService,
    IJwtService jwtService,
    IAuthRepository authRepository,
    IConfiguration configuration)
        {
            _repository = repository;
            _authRepository = authRepository;
            _emailService = emailService;
            _notificationService = notificationService;
            _jwtService = jwtService;
            _configuration = configuration;
        }
        public async Task<LoginResponseDto> GoogleLoginAsync(string credential)
        {
            if (string.IsNullOrWhiteSpace(credential))
                throw new UnauthorizedAccessException("Google credential is required.");

            var googleClientId = _configuration["Google:ClientId"];

            if (string.IsNullOrWhiteSpace(googleClientId))
                throw new InvalidOperationException(
                    "Google Client ID is not configured.");

            GoogleJsonWebSignature.Payload payload;

            try
            {
                var validationSettings =
                    new GoogleJsonWebSignature.ValidationSettings
                    {
                        Audience = new[] { googleClientId }
                    };

                payload = await GoogleJsonWebSignature.ValidateAsync(
                    credential,
                    validationSettings);
            }
            catch
            {
                throw new UnauthorizedAccessException(
                    "Invalid Google credential.");
            }

            var googleSubjectId = payload.Subject;
            var email = payload.Email;

            if (string.IsNullOrWhiteSpace(googleSubjectId))
                throw new UnauthorizedAccessException(
                    "Google account ID could not be verified.");

            if (string.IsNullOrWhiteSpace(email))
                throw new UnauthorizedAccessException(
                    "Google account email could not be verified.");

            if (payload.EmailVerified != true)
                throw new UnauthorizedAccessException(
                    "Google account email is not verified.");

            // 1. Try Google Subject ID first
            var employee =
                await _repository.GetByGoogleSubjectIdAsync(
                    googleSubjectId);

            // 2. If not linked yet, find employee by email
            if (employee == null)
            {
                employee =
                    await _repository.GetByEmailGlobalAsync(email);
            }

            if (employee == null)
            {
                throw new UnauthorizedAccessException(
                    "No employee is registered with this Google account email.");
            }

            if (string.IsNullOrWhiteSpace(employee.Status) ||
                !employee.Status.Equals(
                    "Active",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException(
                    "Employee account is not active.");
            }

            if (!employee.UserId.HasValue)
            {
                throw new UnauthorizedAccessException(
                    "Employee account is not linked to a user account.");
            }

            
            // User is already loaded by EmployeeRepository
            var user = employee.User;

            if (user == null)
            {
                throw new UnauthorizedAccessException(
                    "Employee user account could not be found.");
            }
            if (user.OrganizationId != employee.OrganizationId)
            {
                throw new UnauthorizedAccessException(
                    "Employee organization information is invalid.");
            }

            // Link Google account on first successful login
            if (string.IsNullOrWhiteSpace(employee.GoogleSubjectId))
            {
                await _repository.LinkGoogleSubjectIdAsync(
                    employee.EmployeeId,
                    googleSubjectId);
            }
            else if (employee.GoogleSubjectId != googleSubjectId)
            {
                throw new UnauthorizedAccessException(
                    "This employee is linked to a different Google account.");
            }

            // Generate the existing TalentSphere JWT
            var token = _jwtService.GenerateToken(
                user.UserId,
                user.Email ?? employee.Email,
                user.Role.ToString(),
                user.OrganizationId);

            var employeeName =
                $"{employee.FirstName} {employee.LastName}".Trim();

            return new LoginResponseDto
            {
                Success = true,
                Message = "Google login successful.",
                Token = token,
                Role = user.Role.ToString(),
                UserId = user.UserId,
                Name = employeeName,
                Email = employee.Email
            };
        }
        // ==========================================
        // GET ALL
        // ==========================================

        public async Task<(
            IEnumerable<EmployeeResponseDto> Employees,
            int TotalCount)> GetAllAsync(
                EmployeeQueryParameters query)
        {
            var (employees, totalCount) =
                await _repository.GetAllAsync(query);

            var result = employees.Select(x =>
                new EmployeeResponseDto
                {
                    EmployeeId = x.EmployeeId,
                    FirstName = x.FirstName,
                    LastName = x.LastName,
                    Email = x.Email,
                    Phone = x.Phone,
                    Role = x.Role,
                    Status = x.Status,
                    EmployeeType = x.EmployeeType,
                    ProfilePhotoUrl = x.ProfilePhotoUrl

                });

            return (result, totalCount);
        }

        // ==========================================
        // GET BY ID
        // ==========================================

        public async Task<EmployeeResponseDto?>
            GetByIdAsync(int id)
        {
            var employee =
                await _repository.GetByIdAsync(id);

            if (employee == null)
                return null;

            return new EmployeeResponseDto
            {
                EmployeeId = employee.EmployeeId,
                UserId = employee.UserId,
                FirstName = employee.FirstName,
                LastName = employee.LastName,
                Email = employee.Email,
                Phone = employee.Phone,
                Role = employee.Role,
                Status = employee.Status,
                EmployeeType = employee.EmployeeType,
                ProfilePhotoUrl = employee.ProfilePhotoUrl
            };
        }

        // ==========================================
        // CREATE
        // ==========================================

        public async Task<EmployeeResponseDto>
            CreateAsync(CreateEmployeeDto dto)
        {
            // ======================================
            // 1. Validate role
            // ======================================

            var roleText =
                dto.Role
                    .Trim()
                    .Replace(" ", "");

            if (!Enum.TryParse<UserRole>(
                roleText,
                true,
                out var userRole))
            {
                throw new Exception(
                    $"Invalid employee role: {dto.Role}");
            }

            if (!IsEmployeeRole(userRole))
            {
                throw new Exception(
                    $"Role '{dto.Role}' is not a valid employee role.");
            }

            // ======================================
            // 2. Validate duplicate Employee
            // ======================================

            var employeeEmailExists =
                await _repository.EmailExistsAsync(
                    dto.Email);

            if (employeeEmailExists)
            {
                throw new Exception(
                    "An employee with this email already exists in your organization.");
            }

            // ======================================
            // 3. Check User duplicate
            // ======================================

            var existingUser =
                await _authRepository
                    .GetByIdentifierAsync(dto.Email);

            if (existingUser != null)
            {
                throw new Exception(
                    "A user with this email already exists.");
            }

            // ======================================
            // 4. Generate temporary password
            // ======================================

            var temporaryPassword =
                GenerateTemporaryPassword();

            var passwordHash =
                PasswordHelper.HashPassword(
                    temporaryPassword);

            // ======================================
            // 5. Create Employee
            // ======================================

            var employee = new Employee
            {
                FirstName =
                    dto.FirstName.Trim(),

                LastName =
                    dto.LastName.Trim(),

                Email =
                    dto.Email.Trim(),

                Phone =
                    dto.Phone.Trim(),

                Role =
                    GetDisplayRole(userRole),

                Status =
                    dto.Status.Trim(),

                EmployeeType =
                    dto.EmployeeType.Trim(),

                PasswordHash =
                    passwordHash
            };

            await _repository.CreateAsync(employee);

            // ======================================
            // 6. Create Login User
            // ======================================

            var user = new User
            {
                FirstName =
                    employee.FirstName,

                LastName =
                    employee.LastName,

                Email =
                    employee.Email,

                Phone =
                    employee.Phone,

                PasswordHash =
                    passwordHash,

                Role =
                    userRole,

                OrganizationId =
                    employee.OrganizationId,

                IsEmailVerified =
                    true,

                IsPhoneVerified =
                    true,

                CreatedDate =
                    DateTime.UtcNow
            };

            await _authRepository
                .CreateUserAsync(user);

            // ======================================
            // 7. Link Employee -> User
            // ======================================

            employee.UserId =
                user.UserId;

            await _repository
                .UpdateAsync(employee);

            // ======================================
            // 8. Send Welcome Email
            // ======================================

            await _emailService
                .SendEmployeeWelcomeEmailAsync(
                    employee.Email,
                    employee.FirstName,
                    employee.LastName,
                    temporaryPassword);

            // ======================================
            // 9. Return Employee
            // ======================================
            var createdEmployee =
                await GetByIdAsync(
                    employee.EmployeeId);

            if (createdEmployee == null)
            {
                throw new Exception(
                    "Employee creation failed.");
            }

            // =====================================================
            // ORGANIZATION NOTIFICATION
            // =====================================================

            if (employee.Role.Equals(
                    "HR",
                    StringComparison.OrdinalIgnoreCase))
            {
                // ================================================
                // HR USER CREATED
                // ================================================

                await _notificationService
    .CreateOrganizationNotificationAsync(
        employee.OrganizationId,
        "New HR User Created",
        $"{employee.FirstName} {employee.LastName} has been added as an HR user.",
        NotificationType.HRUserCreated,
        employee.EmployeeId,
        ReferenceType.HRUser);
            }
            else if (employee.Role.Equals(
                         "Mentor",
                         StringComparison.OrdinalIgnoreCase))
            {
                // ================================================
                // MENTOR CREATED THROUGH EMPLOYEE
                // ================================================

                await _notificationService
    .CreateOrganizationNotificationAsync(
        employee.OrganizationId,
        "New Mentor Created",
        $"{employee.FirstName} {employee.LastName} has been added as a mentor.",
        NotificationType.MentorCreated,
        employee.EmployeeId,
        ReferenceType.Mentor);
            }
            else
            {
                // ================================================
                // NORMAL EMPLOYEE CREATED
                // ================================================

                await _notificationService
      .CreateOrganizationNotificationAsync(
          employee.OrganizationId,
          "New Employee Created",
          $"{employee.FirstName} {employee.LastName} has been added to your organization.",
          NotificationType.EmployeeCreated,
          employee.EmployeeId,
          ReferenceType.Employee);
            }

                return createdEmployee;
        }

        // ==========================================
        // UPDATE
        // ==========================================

        public async Task<EmployeeResponseDto?>
            UpdateAsync(
                int id,
                UpdateEmployeeDto dto)
        {
            var employee =
                await _repository
                    .GetByIdAsync(id);

            if (employee == null)
            {
                return null;
            }
            var previousStatus =
    employee.Status;

            var previousRole =
    employee.Role;

            // ======================================
            // Validate role
            // ======================================

            var roleText =
                dto.Role
                    .Trim()
                    .Replace(" ", "");

            if (!Enum.TryParse<UserRole>(
                roleText,
                true,
                out var newUserRole))
            {
                throw new Exception(
                    $"Invalid employee role: {dto.Role}");
            }

            if (!IsEmployeeRole(newUserRole))
            {
                throw new Exception(
                    $"Role '{dto.Role}' is not a valid employee role.");
            }

            // ======================================
            // Update Employee
            // ======================================

            employee.FirstName =
                dto.FirstName.Trim();

            employee.LastName =
                dto.LastName.Trim();

            employee.Email =
                dto.Email.Trim();

            employee.Phone =
                dto.Phone.Trim();

            employee.Role =
                GetDisplayRole(newUserRole);

            employee.Status =
                dto.Status.Trim();

            employee.EmployeeType =
                dto.EmployeeType.Trim();

            await _repository
                .UpdateAsync(employee);

            // ======================================
            // Update linked User
            // ======================================

            if (employee.UserId.HasValue)
            {
                var user =
                    await _authRepository
                        .GetUserByIdAsync(
                            employee.UserId.Value);

                if (user != null &&
                    user.OrganizationId ==
                        employee.OrganizationId)
                {
                    user.Role =
                        newUserRole;

                    user.FirstName =
                        employee.FirstName;

                    user.LastName =
                        employee.LastName;

                    user.Email =
                        employee.Email;

                    user.Phone =
                        employee.Phone;

                    await _authRepository
                        .UpdateUserAsync(user);
                }
            }

            var updatedEmployee =
     await GetByIdAsync(id);



            // =====================================================
            // ROLE CHANGED
            // =====================================================

            if (!string.Equals(
                    previousRole,
                    employee.Role,
                    StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    await _notificationService.CreateOrganizationNotificationAsync(
                        employee.OrganizationId,
                        "Employee Role Changed",
                        $"{employee.FirstName} {employee.LastName}'s role has been changed from {previousRole} to {employee.Role}.",
                        NotificationType.RoleChanged,
                        employee.EmployeeId,
                        ReferenceType.Employee);
                }
                catch
                {
                    // Employee role update is already completed.
                    // Notification failure must not undo the role update.
                }
            }

            // =====================================================
            // EMPLOYEE DEACTIVATED
            // =====================================================

            if (!string.Equals(
                    previousStatus,
                    "Inactive",
                    StringComparison.OrdinalIgnoreCase) &&
                string.Equals(
                    employee.Status,
                    "Inactive",
                    StringComparison.OrdinalIgnoreCase))
            {
                await _notificationService
     .CreateOrganizationNotificationAsync(
         employee.OrganizationId,
         "New Employee Created",
         $"{employee.FirstName} {employee.LastName} has been added to your organization.",
         NotificationType.EmployeeCreated,
         employee.EmployeeId,
         ReferenceType.Employee);
            }
            // =====================================================
            // EMPLOYEE PROFILE UPDATED
            // =====================================================

            else
            {
                await _notificationService
    .CreateOrganizationNotificationAsync(
        employee.OrganizationId,
        "Employee Deactivated",
        $"{employee.FirstName} {employee.LastName} has been deactivated.",
        NotificationType.EmployeeDeactivated,
        employee.EmployeeId,
        ReferenceType.Employee);
            }

                return updatedEmployee;
        }

        // ==========================================
        // DELETE
        // ==========================================

        public async Task<bool>
    DeleteAsync(int id)
        {
            var employee =
                await _repository
                    .GetByIdAsync(id);

            if (employee == null)
            {
                return false;
            }

            var organizationId =
                employee.OrganizationId;

            var employeeName =
                $"{employee.FirstName} {employee.LastName}";

            var result =
                await _repository
                    .DeleteAsync(id);

            if (!result)
            {
                return false;
            }

            // =====================================================
            // ORGANIZATION NOTIFICATION
            // =====================================================

            await _notificationService
    .CreateOrganizationNotificationAsync(
        organizationId,
        "Employee Deleted",
        $"{employeeName} has been removed from your organization.",
        NotificationType.EmployeeDeleted,
        id,
        ReferenceType.Employee); 
            return true;
        }

        // ==========================================
        // VALID EMPLOYEE ROLES
        // ==========================================

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

        // ==========================================
        // DISPLAY ROLE
        // ==========================================

        private static string GetDisplayRole(
            UserRole role)
        {
            return role switch
            {
                UserRole.HRRecruiter =>
                    "HR Recruiter",

                UserRole.HRExecutive =>
                    "HR Executive",

                UserRole.OperationAssociate =>
                    "Operation Associate",

                _ =>
                    role.ToString()
            };
        }

        // ==========================================
        // TEMPORARY PASSWORD
        // ==========================================

        private string GenerateTemporaryPassword()
        {
            const string chars =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                "abcdefghijklmnopqrstuvwxyz" +
                "0123456789@#$";

            var random =
                new Random();

            return new string(
                Enumerable
                    .Repeat(chars, 10)
                    .Select(s =>
                        s[random.Next(s.Length)])
                    .ToArray());
        }
    }
}
