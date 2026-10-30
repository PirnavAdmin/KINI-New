using TalentSphereAPI.DTOs;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories.Interfaces
{
    public interface IRegistrationRepository
    {
        Task<Registration> CreateAsync(RegistrationDto dto);
        Task<List<Registration>> GetAllAsync();
        Task<Registration?> GetByIdAsync(int id);
    }
}