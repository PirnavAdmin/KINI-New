using TalentSphereAPI.DTOs.SuperAdmin;

namespace TalentSphereAPI.Repositories.Interfaces
{
    public interface ISuperAdminDashboardRepository
    {
        Task<OrganizationDashboardSummaryDto>
            GetOrganizationSummaryAsync();

        Task<List<OrganizationDashboardListDto>>
            GetOrganizationsAsync();

        Task<OrganizationDashboardDetailsDto?>
            GetOrganizationDetailsAsync(int organizationId);

        Task<OrganizationSubscriptionDto?>
            GetOrganizationSubscriptionAsync(int organizationId);
    }
}