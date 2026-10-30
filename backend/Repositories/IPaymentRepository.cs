using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories
{
    public interface IPaymentRepository
    {
        Task<Order> CreateOrderAsync(Order order);

        Task<Order?> GetOrderByIdAsync(int id);

        Task<List<Payment>> GetPaymentHistoryAsync(int userId);

        Task<Coupon?> GetCouponAsync(string couponCode);

        Task SavePaymentAsync(Payment payment);
    }
}