using TalentSphereAPI.DTOs;
using TalentSphereAPI.DTOs.Subscriptions;

namespace TalentSphereAPI.Services

{

    public interface ISubscriptionService

    {

        Task<IEnumerable<SubscriptionResponseDto>> GetAllAsync();

        Task<SubscriptionResponseDto?> GetByIdAsync(int id);

        Task CreateAsync(CreateSubscriptionDto dto);

        Task<bool> UpdateAsync(int id, UpdateSubscriptionDto dto);

        Task<bool> DeleteAsync(int id);

    }

}
