using TalentSphereAPI.DTOs;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories.Interfaces
{
    public interface IGetInTouchRepository
    {
        Task<GetInTouch> CreateAsync(GetInTouchDto dto);
        Task<List<GetInTouch>> GetAllAsync();
        Task<GetInTouch?> GetByIdAsync(int id);
    }
}

