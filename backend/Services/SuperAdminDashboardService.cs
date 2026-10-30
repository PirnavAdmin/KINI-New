using TalentSphereAPI.DTOs.SuperAdmin;
using TalentSphereAPI.Repositories.Interfaces;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services
{
    public class SuperAdminDashboardService
        : ISuperAdminDashboardService
    {
        private readonly ISuperAdminDashboardRepository _repository;

        public SuperAdminDashboardService(
            ISuperAdminDashboardRepository repository)
        {
            _repository = repository;
        }

        public Task<OrganizationDashboardSummaryDto>
            GetOrganizationSummaryAsync()
        {
            return _repository
                .GetOrganizationSummaryAsync();
        }

        public Task<List<OrganizationDashboardListDto>>
            GetOrganizationsAsync()
        {
            return _repository
                .GetOrganizationsAsync();
        }

        public Task<OrganizationDashboardDetailsDto?>
            GetOrganizationDetailsAsync(
                int organizationId)
        {
            return _repository
                .GetOrganizationDetailsAsync(
                    organizationId);
        }

        public Task<OrganizationSubscriptionDto?>
            GetOrganizationSubscriptionAsync(
                int organizationId)
        {
            return _repository
                .GetOrganizationSubscriptionAsync(
                    organizationId);
        }
    }
}