using Google.Apis.Auth;
using TalentSphereAPI.DTOs.Organization;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services
{
    public class OrganizationService : IOrganizationService
    {
        private readonly IOrganizationRepository _repository;
        private readonly IJwtService _jwtService;
        private readonly IConfiguration _configuration;

        public OrganizationService(
            IOrganizationRepository repository,
            IJwtService jwtService,
            IConfiguration configuration)
        {
            _repository = repository;
            _jwtService = jwtService;
            _configuration = configuration;
        }

        // ==========================================
        // ORGANIZATION REGISTRATION
        // ==========================================

        public async Task<string> RegisterOrganizationAsync(
            CreateOrganizationDto dto)
        {
            var existingOrganization =
                await _repository.GetByEmailAsync(dto.Email);

            if (existingOrganization != null)
            {
                return "Organization with this email already exists.";
            }

            var organization = new Organization
            {
                OrganizationName = dto.OrganizationName,
                Email = dto.Email,
                Phone = dto.Phone,
                Industry = dto.Industry,
                Country = dto.Country,
                Website = dto.Website,

                PasswordHash =
                    BCrypt.Net.BCrypt.HashPassword(
                        dto.Password)
            };

            var result =
                await _repository.CreateAsync(organization);

            return result
                ? "Organization registered successfully."
                : "Organization registration failed. Please try again.";
        }

        // ==========================================
        // NORMAL EMAIL/PASSWORD LOGIN
        // ==========================================

        public async Task<OrganizationLoginResponseDto> LoginAsync(
            LoginOrganizationDto dto)
        {
            var organization =
                await _repository.GetByEmailAsync(dto.Email);

            if (organization == null)
            {
                throw new UnauthorizedAccessException(
                    "Invalid email or password.");
            }

            if (!BCrypt.Net.BCrypt.Verify(
                    dto.Password,
                    organization.PasswordHash))
            {
                throw new UnauthorizedAccessException(
                    "Invalid email or password.");
            }

            var token = GenerateOrganizationToken(
                organization);

            return CreateLoginResponse(
                organization,
                token,
                "Login successful.");
        }

        // ==========================================
        // GOOGLE LOGIN
        // ==========================================

        public async Task<OrganizationLoginResponseDto> GoogleLoginAsync(
            GoogleLoginDto dto)
        {
            if (dto == null ||
                string.IsNullOrWhiteSpace(dto.Credential))
            {
                throw new UnauthorizedAccessException(
                    "Google credential is required.");
            }

            // ==========================================
            // GET GOOGLE CLIENT ID
            // ==========================================

            var googleClientId =
                _configuration["Google:ClientId"];

            if (string.IsNullOrWhiteSpace(googleClientId))
            {
                throw new InvalidOperationException(
                    "Google Client ID is not configured.");
            }

            GoogleJsonWebSignature.Payload payload;

            try
            {
                // ==========================================
                // VALIDATE GOOGLE ID TOKEN
                // ==========================================

                var validationSettings =
                    new GoogleJsonWebSignature.ValidationSettings
                    {
                        Audience = new[]
                        {
                            googleClientId
                        }
                    };

                payload =
                    await GoogleJsonWebSignature.ValidateAsync(
                        dto.Credential,
                        validationSettings);
            }
            catch
            {
                throw new UnauthorizedAccessException(
                    "Invalid Google credential.");
            }

            // ==========================================
            // GOOGLE USER INFORMATION
            // ==========================================

            var googleSubjectId = payload.Subject;
            var email = payload.Email;

            if (string.IsNullOrWhiteSpace(
                    googleSubjectId))
            {
                throw new UnauthorizedAccessException(
                    "Google account ID could not be verified.");
            }

            if (string.IsNullOrWhiteSpace(email))
            {
                throw new UnauthorizedAccessException(
                    "Google account email could not be verified.");
            }

            // ==========================================
            // FIRST: FIND BY GOOGLE SUBJECT ID
            // ==========================================

            var organization =
                await _repository.GetByGoogleSubjectIdAsync(
                    googleSubjectId);

            // ==========================================
            // SECOND: FIND BY VERIFIED EMAIL
            // ==========================================

            if (organization == null)
            {
                organization =
                    await _repository.GetByEmailAsync(
                        email);
            }

            // ==========================================
            // ORGANIZATION NOT REGISTERED
            // ==========================================

            if (organization == null)
            {
                throw new UnauthorizedAccessException(
                    "No organization is registered with this Google account. Please register your organization first.");
            }

            // ==========================================
            // LINK GOOGLE ACCOUNT
            // ==========================================

            if (string.IsNullOrWhiteSpace(
                    organization.GoogleSubjectId))
            {
                organization.GoogleSubjectId =
                    googleSubjectId;

                await _repository.UpdateAsync(
                    organization);
            }
            else if (
                organization.GoogleSubjectId !=
                googleSubjectId)
            {
                throw new UnauthorizedAccessException(
                    "This organization is linked to a different Google account.");
            }

            // ==========================================
            // GENERATE TALENTSPHERE JWT
            // ==========================================

            var token =
                GenerateOrganizationToken(
                    organization);

            return CreateLoginResponse(
                organization,
                token,
                "Google login successful.");
        }

        // ==========================================
        // GENERATE ORGANIZATION JWT
        // ==========================================

        private string GenerateOrganizationToken(
            Organization organization)
        {
            return _jwtService.GenerateToken(
                organization.OrganizationId,
                organization.Email,
                "OrganizationAdmin",
                organization.OrganizationId);
        }

        // ==========================================
        // LOGIN RESPONSE
        // ==========================================

        private OrganizationLoginResponseDto
            CreateLoginResponse(
                Organization organization,
                string token,
                string message)
        {
            return new OrganizationLoginResponseDto
            {
                Message = message,

                OrganizationId =
                    organization.OrganizationId,

                OrganizationName =
                    organization.OrganizationName,

                Email =
                    organization.Email,

                Token = token,

                Expiration =
                    DateTime.UtcNow.AddMinutes(
                        _configuration.GetValue<int>(
                            "Jwt:DurationInMinutes"))
            };
        }

        // ==========================================
        // GET ALL ORGANIZATIONS
        // ==========================================

        public async Task<List<Organization>>
            GetOrganizationsAsync()
        {
            return await _repository.GetAllAsync();
        }

        // ==========================================
        // GET ORGANIZATION BY ID
        // ==========================================

        public async Task<Organization?> GetByIdAsync(
            int organizationId)
        {
            return await _repository.GetByIdAsync(
                organizationId);
        }

        // ==========================================
        // UPDATE ORGANIZATION
        // ==========================================

        public async Task<string> UpdateOrganizationAsync(
            int organizationId,
            UpdateOrganizationDto dto)
        {
            var organization =
                await _repository.GetByIdAsync(
                    organizationId);

            if (organization == null)
                return "Organization not found.";

            organization.OrganizationName =
                dto.OrganizationName;

            organization.Email =
                dto.Email;

            organization.Phone =
                dto.Phone;

            organization.Industry =
                dto.Industry;

            organization.Country =
                dto.Country;

            organization.Website =
                dto.Website;

            var result =
                await _repository.UpdateAsync(
                    organization);

            return result
                ? "Organization updated successfully."
                : "Organization update failed.";
        }

        // ==========================================
        // DELETE ORGANIZATION
        // ==========================================

        public async Task<string> DeleteOrganizationAsync(
            int organizationId)
        {
            var result =
                await _repository.DeleteAsync(
                    organizationId);

            return result
                ? "Organization deleted successfully."
                : "Organization not found.";
        }
    }
}