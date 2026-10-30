using Microsoft.EntityFrameworkCore;

using TalentSphereAPI.Data;

using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories

{

    public class SubscriptionRepository : ISubscriptionRepository

    {

        private readonly ApplicationDbContext _context;

        public SubscriptionRepository(ApplicationDbContext context)

        {

            _context = context;

        }

        public async Task<IEnumerable<Subscription>> GetAllAsync()

        {

            return await _context.Subscriptions.ToListAsync();

        }

        public async Task<Subscription?> GetByIdAsync(int id)

        {

            return await _context.Subscriptions

                .FirstOrDefaultAsync(x => x.SubscriptionId == id);

        }

        public async Task AddAsync(Subscription subscription)

        {

            await _context.Subscriptions.AddAsync(subscription);

        }

        public void Update(Subscription subscription)

        {

            _context.Subscriptions.Update(subscription);

        }

        public void Delete(Subscription subscription)

        {

            _context.Subscriptions.Remove(subscription);

        }

        public async Task SaveAsync()

        {

            await _context.SaveChangesAsync();

        }

    }

}
