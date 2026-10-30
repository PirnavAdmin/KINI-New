using TalentSphereAPI.DTOs;

namespace TalentSphereAPI.Services
{
    public interface IDashboardService
    {
        Task<SuperAdminDashboardDto> GetSuperAdminDashboardAsync();

        Task<OrganizationDashboardDto> GetOrganizationDashboardAsync();

        Task<EmployeeDashboardDto> GetEmployeeDashboardAsync();

        Task<StudentDashboardDto> GetStudentDashboardAsync();

        Task<TalentSphereAPI.DTOs.Dashboard.HrDashboardDto> GetHrDashboardAsync();
    }
}