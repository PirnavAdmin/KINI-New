using Microsoft.AspNetCore.Identity;

using TalentSphereAPI.DTOs.SuperAdmin;

using TalentSphereAPI.Repositories.Interfaces;

using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services

{

    public class SuperAdminAuthService : ISuperAdminAuthService

    {

        private readonly ISuperAdminRepository _repository;

        private readonly IJwtService _jwtService;

        public SuperAdminAuthService(

            ISuperAdminRepository repository,

            IJwtService jwtService)

        {

            _repository = repository;

            _jwtService = jwtService;

        }

        public async Task<string> LoginAsync(SuperAdminLoginDto dto)

        {

            var admin = await _repository.GetByEmailAsync(dto.Email);

            if (admin == null)

                throw new Exception("Invalid email or password.");

            var passwordHasher = new PasswordHasher<object>();

            var result = passwordHasher.VerifyHashedPassword(

                new object(),

                admin.PasswordHash,

                dto.Password);

            if (result == PasswordVerificationResult.Failed)

                throw new Exception("Invalid email or password.");

            return _jwtService.GenerateSuperAdminToken(admin);

        }

    }

}
