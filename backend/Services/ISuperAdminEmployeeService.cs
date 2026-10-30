using TalentSphereAPI.DTOs.Employee;

namespace TalentSphereAPI.Services
{
    public interface ISuperAdminEmployeeService
    {
        Task<(
            IEnumerable<EmployeeResponseDto> Employees,
            int TotalCount)>
            GetAllByOrganizationAsync(
                int organizationId,
                EmployeeQueryParameters query);

        Task<EmployeeResponseDto?>
            GetByIdAsync(
                int organizationId,
                int employeeId);
    }
}