using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.SuperAdmin;
using TalentSphereAPI.Repositories.Interfaces;

namespace TalentSphereAPI.Repositories
{
    public class SuperAdminDashboardRepository
        : ISuperAdminDashboardRepository
    {
        private readonly ApplicationDbContext _context;

        public SuperAdminDashboardRepository(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<OrganizationDashboardSummaryDto>
            GetOrganizationSummaryAsync()
        {
            var today = DateTime.UtcNow;

            var totalOrganizations =
                await _context.Organizations.CountAsync();

            // New organizations created during the current month
            var startOfMonth = new DateTime(
                today.Year,
                today.Month,
                1);

            var newOrganizations =
                await _context.Organizations
                    .CountAsync(x =>
                        x.CreatedDate >= startOfMonth);

            var activeSubscriptions =
                await _context.Subscriptions
                    .CountAsync(x =>
                        x.IsActive &&
                        x.ExpiryDate >= today);

            var expiredSubscriptions =
                await _context.Subscriptions
                    .CountAsync(x =>
                        x.ExpiryDate < today);

            // Expiring within the next 30 days
            var expiryLimit = today.AddDays(30);

            var expiringSubscriptions =
                await _context.Subscriptions
                    .CountAsync(x =>
                        x.IsActive &&
                        x.ExpiryDate >= today &&
                        x.ExpiryDate <= expiryLimit);

            return new OrganizationDashboardSummaryDto
            {
                TotalOrganizations = totalOrganizations,

                NewOrganizations = newOrganizations,

                ActiveSubscriptions = activeSubscriptions,

                ExpiringSubscriptions =
                    expiringSubscriptions,

                ExpiredSubscriptions =
                    expiredSubscriptions
            };
        }

        public async Task<List<OrganizationDashboardListDto>>
            GetOrganizationsAsync()
        {
            var today = DateTime.UtcNow;

            return await _context.Organizations
                .Select(x => new OrganizationDashboardListDto
                {
                    OrganizationId =
                        x.OrganizationId,

                    OrganizationName =
                        x.OrganizationName,

                    Email =
                        x.Email,

                    Phone =
                        x.Phone,

                    Industry =
                        x.Industry,

                    Country =
                        x.Country,

                    Website =
                        x.Website,

                    CreatedDate =
                        x.CreatedDate,

                    SubscriptionPlan =
                        x.Subscriptions
                            .Where(s =>
                                s.IsActive &&
                                s.ExpiryDate >= today)
                            .OrderByDescending(s =>
                                s.ExpiryDate)
                            .Select(s => s.PlanName)
                            .FirstOrDefault(),

                    SubscriptionPrice =
                        x.Subscriptions
                            .Where(s =>
                                s.IsActive &&
                                s.ExpiryDate >= today)
                            .OrderByDescending(s =>
                                s.ExpiryDate)
                            .Select(s => (decimal?)s.Price)
                            .FirstOrDefault(),

                    SubscriptionExpiryDate =
                        x.Subscriptions
                            .Where(s =>
                                s.IsActive &&
                                s.ExpiryDate >= today)
                            .OrderByDescending(s =>
                                s.ExpiryDate)
                            .Select(s => (DateTime?)s.ExpiryDate)
                            .FirstOrDefault(),

                    HasActiveSubscription =
                        x.Subscriptions.Any(s =>
                            s.IsActive &&
                            s.ExpiryDate >= today)
                })
                .ToListAsync();
        }

        public async Task<OrganizationDashboardDetailsDto?>
            GetOrganizationDetailsAsync(
                int organizationId)
        {
            var today = DateTime.UtcNow;

            return await _context.Organizations
                .Where(x =>
                    x.OrganizationId == organizationId)
                .Select(x => new OrganizationDashboardDetailsDto
                {
                    OrganizationId =
                        x.OrganizationId,

                    OrganizationName =
                        x.OrganizationName,

                    Email =
                        x.Email,

                    Phone =
                        x.Phone,

                    Industry =
                        x.Industry,

                    Country =
                        x.Country,

                    Website =
                        x.Website,

                    CreatedDate =
                        x.CreatedDate,

                    SubscriptionPlan =
                        x.Subscriptions
                            .Where(s =>
                                s.IsActive &&
                                s.ExpiryDate >= today)
                            .OrderByDescending(s =>
                                s.ExpiryDate)
                            .Select(s => s.PlanName)
                            .FirstOrDefault(),

                    SubscriptionPrice =
                        x.Subscriptions
                            .Where(s =>
                                s.IsActive &&
                                s.ExpiryDate >= today)
                            .OrderByDescending(s =>
                                s.ExpiryDate)
                            .Select(s => (decimal?)s.Price)
                            .FirstOrDefault(),

                    SubscriptionDurationInMonths =
                        x.Subscriptions
                            .Where(s =>
                                s.IsActive &&
                                s.ExpiryDate >= today)
                            .OrderByDescending(s =>
                                s.ExpiryDate)
                            .Select(s => (int?)s.DurationInMonths)
                            .FirstOrDefault(),

                    MaxUsers =
                        x.Subscriptions
                            .Where(s =>
                                s.IsActive &&
                                s.ExpiryDate >= today)
                            .OrderByDescending(s =>
                                s.ExpiryDate)
                            .Select(s => (int?)s.MaxUsers)
                            .FirstOrDefault(),

                    SubscriptionStartDate =
                        x.Subscriptions
                            .Where(s =>
                                s.IsActive &&
                                s.ExpiryDate >= today)
                            .OrderByDescending(s =>
                                s.ExpiryDate)
                            .Select(s => (DateTime?)s.StartDate)
                            .FirstOrDefault(),

                    SubscriptionExpiryDate =
                        x.Subscriptions
                            .Where(s =>
                                s.IsActive &&
                                s.ExpiryDate >= today)
                            .OrderByDescending(s =>
                                s.ExpiryDate)
                            .Select(s => (DateTime?)s.ExpiryDate)
                            .FirstOrDefault(),

                    HasActiveSubscription =
                        x.Subscriptions.Any(s =>
                            s.IsActive &&
                            s.ExpiryDate >= today)
                })
                .FirstOrDefaultAsync();
        }

        public async Task<OrganizationSubscriptionDto?>
            GetOrganizationSubscriptionAsync(
                int organizationId)
        {
            var today = DateTime.UtcNow;

            return await _context.Subscriptions
                .Where(s =>
                    s.OrganizationId == organizationId &&
                    s.IsActive &&
                    s.ExpiryDate >= today)
                .OrderByDescending(s =>
                    s.ExpiryDate)
                .Select(s => new OrganizationSubscriptionDto
                {
                    SubscriptionId =
                        s.SubscriptionId,

                    OrganizationId =
                        s.OrganizationId,

                    OrganizationName =
                        s.Organization!.OrganizationName,

                    PlanName =
                        s.PlanName,

                    Price =
                        s.Price,

                    DurationInMonths =
                        s.DurationInMonths,

                    MaxUsers =
                        s.MaxUsers,

                    StartDate =
                        s.StartDate,

                    ExpiryDate =
                        s.ExpiryDate,

                    IsActive =
                        s.IsActive,

                    Status = "Active"
                })
                .FirstOrDefaultAsync();
        }
    }
}