using TalentSphereAPI.DTOs;
using TalentSphereAPI.Repositories;

namespace TalentSphereAPI.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IDashboardRepository _repository;

        public DashboardService(
            IDashboardRepository repository)
        {
            _repository = repository;
        }

        public async Task<SuperAdminDashboardDto>
            GetSuperAdminDashboardAsync()
        {
            return await _repository
                .GetSuperAdminDashboardAsync();
        }

        public async Task<OrganizationDashboardDto>
            GetOrganizationDashboardAsync()
        {
            return await _repository
                .GetOrganizationDashboardAsync();
        }

        public async Task<EmployeeDashboardDto>
            GetEmployeeDashboardAsync()
        {
            return await _repository
                .GetEmployeeDashboardAsync();
        }

        public async Task<StudentDashboardDto>
            GetStudentDashboardAsync()
        {
            return await _repository
                .GetStudentDashboardAsync();
        }

        public async Task<
            TalentSphereAPI.DTOs.Dashboard.HrDashboardDto>
            GetHrDashboardAsync()
        {
            return await _repository
                .GetHrDashboardAsync();
        }
    }
}