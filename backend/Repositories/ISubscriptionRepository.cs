using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories

{

    public interface ISubscriptionRepository

    {

        Task<IEnumerable<Subscription>> GetAllAsync();

        Task<Subscription?> GetByIdAsync(int id);

        Task AddAsync(Subscription subscription);

        void Update(Subscription subscription);

        void Delete(Subscription subscription);

        Task SaveAsync();

    }

}
