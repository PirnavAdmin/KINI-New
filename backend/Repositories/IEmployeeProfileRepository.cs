using TalentSphereAPI.Models.EmployeeProfile;

namespace TalentSphereAPI.Repositories;

public interface IEmployeeProfileRepository
{
    Task<EmployeeProfile?> GetAsync(int organizationId, int employeeId);
    Task<EmployeeProfile> GetOrCreateAsync(int organizationId, Employee employee);
    Task SaveAsync(EmployeeProfile profile);
}
