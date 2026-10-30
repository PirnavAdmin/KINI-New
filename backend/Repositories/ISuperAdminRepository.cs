using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories.Interfaces

{

    public interface ISuperAdminRepository

    {

        Task<SuperAdmin?> GetByEmailAsync(string email);

    }

}
