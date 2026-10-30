using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories
{
    public interface IOrganizationRepository
    {
        Task<bool> CreateAsync(Organization organization);

        Task<List<Organization>> GetAllAsync();

        Task<Organization?> GetByIdAsync(int organizationId);

        Task<Organization?> GetByEmailAsync(string email);

        Task<Organization?> GetByGoogleSubjectIdAsync(string googleSubjectId);

        Task<bool> UpdateAsync(Organization organization);

        Task<bool> DeleteAsync(int organizationId);
    }
}