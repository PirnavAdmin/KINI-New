using TalentSphereAPI.DTOs;
using TalentSphereAPI.DTOs.Payment;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services
{
    public interface IPaymentService
    {
        Task<Order> CreateOrderAsync(CreateOrderDto dto);

        Task<bool> VerifyPaymentAsync(VerifyPaymentDto dto);

        Task<object> ValidateCouponAsync(CouponDto dto);

        Task<Order?> GetOrderAsync(int id);

        Task<List<Payment>> GetPaymentHistoryAsync(int userId);
    }
}