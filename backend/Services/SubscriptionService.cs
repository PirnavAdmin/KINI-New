using TalentSphereAPI.DTOs.Subscriptions;

using TalentSphereAPI.Models;

using TalentSphereAPI.Repositories;

namespace TalentSphereAPI.Services

{

    public class SubscriptionService : ISubscriptionService

    {

        private readonly ISubscriptionRepository _repository;

        public SubscriptionService(ISubscriptionRepository repository)

        {

            _repository = repository;

        }

        public async Task<IEnumerable<SubscriptionResponseDto>> GetAllAsync()

        {

            var subscriptions = await _repository.GetAllAsync();

            return subscriptions.Select(s => new SubscriptionResponseDto

            {

                SubscriptionId = s.SubscriptionId,

                PlanName = s.PlanName,

                Price = s.Price,

                DurationInMonths = s.DurationInMonths,

                MaxUsers = s.MaxUsers,

                IsActive = s.IsActive

            });

        }

        public async Task<SubscriptionResponseDto?> GetByIdAsync(int id)

        {

            var subscription = await _repository.GetByIdAsync(id);

            if (subscription == null)

                return null;

            return new SubscriptionResponseDto

            {

                SubscriptionId = subscription.SubscriptionId,

                PlanName = subscription.PlanName,

                Price = subscription.Price,

                DurationInMonths = subscription.DurationInMonths,

                MaxUsers = subscription.MaxUsers,

                IsActive = subscription.IsActive

            };

        }

        public async Task CreateAsync(CreateSubscriptionDto dto)

        {

            var subscription = new Subscription

            {

                PlanName = dto.PlanName,

                Price = dto.Price,

                DurationInMonths = dto.DurationInMonths,

                MaxUsers = dto.MaxUsers,

                IsActive = dto.IsActive

            };

            await _repository.AddAsync(subscription);

            await _repository.SaveAsync();

        }

        public async Task<bool> UpdateAsync(int id, UpdateSubscriptionDto dto)

        {

            var subscription = await _repository.GetByIdAsync(id);

            if (subscription == null)

                return false;

            subscription.PlanName = dto.PlanName;

            subscription.Price = dto.Price;

            subscription.DurationInMonths = dto.DurationInMonths;

            subscription.MaxUsers = dto.MaxUsers;

            subscription.IsActive = dto.IsActive;

            _repository.Update(subscription);

            await _repository.SaveAsync();

            return true;

        }

        public async Task<bool> DeleteAsync(int id)

        {

            var subscription = await _repository.GetByIdAsync(id);

            if (subscription == null)

                return false;

            _repository.Delete(subscription);

            await _repository.SaveAsync();

            return true;

        }

    }

}
