using TalentSphereAPI.DTOs.SuperAdmin;

namespace TalentSphereAPI.Services.Interfaces
{
    public interface ISuperAdminDashboardService
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