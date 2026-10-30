using TalentSphereAPI.DTOs.SuperAdmin;

namespace TalentSphereAPI.Services.Interfaces

{

    public interface ISuperAdminAuthService

    {

        Task<string> LoginAsync(SuperAdminLoginDto dto);

    }

}
