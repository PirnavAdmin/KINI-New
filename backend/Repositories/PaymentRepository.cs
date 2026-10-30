using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly ApplicationDbContext _context;

        public PaymentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // CREATE ORDER
        // =========================================================

        public async Task<Order> CreateOrderAsync(Order order)
        {
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return order;
        }

        // =========================================================
        // GET ORDER
        // =========================================================

        public async Task<Order?> GetOrderByIdAsync(int id)
        {
            return await _context.Orders.FindAsync(id);
        }

        // =========================================================
        // PAYMENT HISTORY
        // =========================================================

        public async Task<List<Payment>> GetPaymentHistoryAsync(int userId)
        {
            var orderIds = await _context.Orders
                .Where(o => o.UserId == userId)
                .Select(o => o.Id)
                .ToListAsync();

            return await _context.Payments
                .Where(p => orderIds.Contains(p.OrderId))
                .ToListAsync();
        }

        // =========================================================
        // GET COUPON
        // =========================================================

        public async Task<Coupon?> GetCouponAsync(string couponCode)
        {
            if (string.IsNullOrWhiteSpace(couponCode))
                return null;

            couponCode = couponCode.Trim().ToUpper();

            return await _context.Coupons
                .FirstOrDefaultAsync(c =>
                    c.CouponCode.ToUpper() == couponCode &&
                    c.IsActive);
        }

        // =========================================================
        // SAVE PAYMENT
        // =========================================================

        public async Task SavePaymentAsync(Payment payment)
        {
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();
        }
    }
}