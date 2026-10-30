using TalentSphereAPI.DTOs.Organization;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services
{
    public interface IOrganizationService
    {
        Task<string> RegisterOrganizationAsync(
            CreateOrganizationDto dto);

        Task<OrganizationLoginResponseDto> LoginAsync(
            LoginOrganizationDto dto);

        Task<OrganizationLoginResponseDto> GoogleLoginAsync(
            GoogleLoginDto dto);

        Task<List<Organization>> GetOrganizationsAsync();

        Task<Organization?> GetByIdAsync(
            int organizationId);

        Task<string> UpdateOrganizationAsync(
            int organizationId,
            UpdateOrganizationDto dto);

        Task<string> DeleteOrganizationAsync(
            int organizationId);
    }
}