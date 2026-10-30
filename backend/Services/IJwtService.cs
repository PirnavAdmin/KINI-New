using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(
     int userId,
     string email,
     string role,
     int? organizationId = null,
     int? studentId = null);

        string GenerateSuperAdminToken(
            SuperAdmin superAdmin);
    }
}