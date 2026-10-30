using TalentSphereAPI.DTOs;

namespace TalentSphereAPI.Repositories
{
    public interface IDashboardRepository
    {
        Task<SuperAdminDashboardDto> GetSuperAdminDashboardAsync();

        Task<OrganizationDashboardDto> GetOrganizationDashboardAsync();

        Task<EmployeeDashboardDto> GetEmployeeDashboardAsync();

        Task<StudentDashboardDto> GetStudentDashboardAsync();

        Task<TalentSphereAPI.DTOs.Dashboard.HrDashboardDto>
            GetHrDashboardAsync();
    }
}