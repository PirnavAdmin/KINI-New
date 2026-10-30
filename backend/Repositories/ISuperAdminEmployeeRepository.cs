using TalentSphereAPI.DTOs.Employee;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories
{
    public interface ISuperAdminEmployeeRepository
    {
        Task<(IEnumerable<Employee> Employees, int TotalCount)>
            GetAllByOrganizationAsync(
                int organizationId,
                EmployeeQueryParameters query);

        Task<Employee?> GetByIdAsync(
            int organizationId,
            int employeeId);
    }
}