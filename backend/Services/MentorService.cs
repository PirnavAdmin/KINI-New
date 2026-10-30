using TalentSphereAPI.DTOs.Mentor;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Helpers;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories;
using TalentSphereAPI.Services.Tenancy;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services
{
    public class MentorService : IMentorService
    {
        private readonly IMentorRepository _mentorRepository;

        private readonly IAuthRepository _authRepository;

        private readonly IEmailService _emailService;

        private readonly ITenantContext _tenantContext;
        private readonly INotificationService _notificationService;
        public MentorService(
     IMentorRepository mentorRepository,
     IAuthRepository authRepository,
     IEmailService emailService,
     ITenantContext tenantContext,
     INotificationService notificationService)
        {
            _mentorRepository =
                mentorRepository;

            _authRepository =
                authRepository;

            _emailService =
                emailService;

            _tenantContext =
                tenantContext;

            _notificationService =
                notificationService;
        }
        // =====================================================
        // GET ALL
        // =====================================================

        public async Task<(
            IEnumerable<MentorListDto> Mentors,
            int TotalCount)> GetAllAsync(
                MentorQueryParameters query)
        {
            return await _mentorRepository
                .GetAllAsync(query);
        }

        // =====================================================
        // GET BY ID
        // =====================================================

        public async Task<MentorDto?> GetByIdAsync(
            int mentorId)
        {
            return await _mentorRepository
                .GetByIdAsync(mentorId);
        }

        public async Task<bool> CreateAsync(
    CreateMentorDto dto)
        {
            var organizationId =
                _tenantContext.OrganizationId;

            // =============================================
            // Check login user
            // =============================================

            var existingUser =
                await _authRepository
                    .GetByIdentifierAsync(dto.Email);

            if (existingUser != null)
            {
                throw new Exception(
                    "Email already exists.");
            }

            // =============================================
            // Generate temporary password
            // =============================================

            var temporaryPassword =
                GenerateTemporaryPassword();

            // =============================================
            // Create mentor
            // =============================================

            var mentorCreated =
                await _mentorRepository
                    .CreateAsync(dto);

            if (!mentorCreated)
            {
                throw new Exception(
                    "Mentor creation failed.");
            }

            // =============================================
            // Create login credentials
            // =============================================

            var user = new User
            {
                FirstName =
                    dto.FirstName,

                LastName =
                    dto.LastName,

                Email =
                    dto.Email,

                Phone =
                    dto.Phone,

                PasswordHash =
                    PasswordHelper.HashPassword(
                        temporaryPassword),

                Role =
                    UserRole.Mentor,

                OrganizationId =
                    organizationId,

                IsEmailVerified =
                    true,

                IsPhoneVerified =
                    true,

                CreatedDate =
                    DateTime.UtcNow
            };

            await _authRepository
                .CreateUserAsync(user);

            // =============================================
            // Send welcome email
            // =============================================

            await _emailService
                .SendMentorWelcomeEmailAsync(
                    dto.Email,
                    dto.FirstName,
                    dto.LastName,
                    temporaryPassword);

            // =====================================================
            // ORGANIZATION NOTIFICATION
            // =====================================================

            var mentorId =
                await _mentorRepository
                    .GetIdByEmailAsync(dto.Email);

            if (mentorId.HasValue)
            {
                await _notificationService
                    .CreateOrganizationNotificationAsync(
                        organizationId,
                        "New Mentor Created",
                        $"{dto.FirstName} {dto.LastName} has been added as a mentor.",
                        NotificationType.MentorCreated,
                        mentorId.Value,
                        ReferenceType.Mentor);
            }

            return true;
        }

        // =====================================================
        // UPDATE
        // =====================================================

        public async Task<bool> UpdateAsync(
       int mentorId,
       UpdateMentorDto dto)
        {
            var result = await _mentorRepository
                .UpdateAsync(
                    mentorId,
                    dto);

            if (!result)
                return false;

            // Keep the login User email synchronized
            // with the Mentor email.
            var user = await _authRepository
                .GetByIdentifierAsync(dto.Email);

            if (user != null &&
                user.Role == UserRole.Mentor)
            {
                user.Email = dto.Email;
                user.FirstName = dto.FirstName;
                user.LastName = dto.LastName;
                user.Phone = dto.Phone;

                await _authRepository
                    .UpdateUserAsync(user);
            }

            return true;
        }

        // =====================================================
        // DELETE
        // =====================================================

        public async Task<bool> DeleteAsync(
            int mentorId)
        {
            // Tenant validation happens
            // inside MentorRepository.
            return await _mentorRepository
                .DeleteAsync(mentorId);
        }

        // =====================================================
        // Temporary Password
        // =====================================================

        private string GenerateTemporaryPassword()
        {
            const string chars =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                "abcdefghijklmnopqrstuvwxyz" +
                "0123456789@#$";

            var random = new Random();

            return new string(
                Enumerable
                    .Repeat(chars, 10)
                    .Select(s =>
                        s[random.Next(s.Length)])
                    .ToArray());
        }
    }
}