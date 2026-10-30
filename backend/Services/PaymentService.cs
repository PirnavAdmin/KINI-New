using TalentSphereAPI.DTOs;
using TalentSphereAPI.DTOs.Payment;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories;

namespace TalentSphereAPI.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _repository;

        public PaymentService(IPaymentRepository repository)
        {
            _repository = repository;
        }

        // =========================================================
        // CREATE ORDER
        // =========================================================

        public async Task<Order> CreateOrderAsync(CreateOrderDto dto)
        {
            if (dto.Amount <= 0)
                throw new ArgumentException("Amount must be greater than zero.");

            decimal discount = 0;

            string? couponCode = null;

            // -----------------------------------------------------
            // APPLY COUPON AGAIN ON BACKEND
            // -----------------------------------------------------

            if (!string.IsNullOrWhiteSpace(dto.CouponCode))
            {
                couponCode = dto.CouponCode.Trim().ToUpper();

                var coupon = await _repository.GetCouponAsync(couponCode);

                if (coupon == null)
                    throw new ArgumentException("Invalid coupon code.");

                // Check expiry
                if (coupon.ExpiryDate < DateTime.UtcNow)
                    throw new ArgumentException("This coupon has expired.");

                // Fixed amount coupon
                if (coupon.DiscountAmount.HasValue &&
                    coupon.DiscountAmount.Value > 0)
                {
                    discount = coupon.DiscountAmount.Value;
                }
                // Percentage coupon
                else if (coupon.DiscountPercentage > 0)
                {
                    discount =
                        dto.Amount *
                        coupon.DiscountPercentage /
                        100;
                }

                // Never allow discount greater than order amount
                if (discount > dto.Amount)
                    discount = dto.Amount;
            }

            decimal finalAmount = dto.Amount - discount;

            // Round monetary values
            discount = Math.Round(discount, 2);
            finalAmount = Math.Round(finalAmount, 2);

            var order = new Order
            {
                UserId = dto.UserId,

                // Original price
                Amount = dto.Amount,

                Currency = dto.Currency,

                Status = "Pending",

                CouponCode = couponCode,

                // Actual discount
                Discount = discount,

                // Actual amount customer must pay
                FinalAmount = finalAmount
            };

            return await _repository.CreateOrderAsync(order);
        }

        // =========================================================
        // VERIFY PAYMENT
        // =========================================================

        public async Task<bool> VerifyPaymentAsync(VerifyPaymentDto dto)
        {
            var payment = new Payment
            {
                OrderId = dto.OrderId,
                PaymentId = dto.PaymentId,
                Status = "Success"
            };

            await _repository.SavePaymentAsync(payment);

            return true;
        }

        // =========================================================
        // VALIDATE COUPON
        // =========================================================

        public async Task<object> ValidateCouponAsync(CouponDto dto)
        {
            if (dto.Amount <= 0)
            {
                return new
                {
                    Valid = false,
                    Message = "Invalid amount."
                };
            }

            if (string.IsNullOrWhiteSpace(dto.CouponCode))
            {
                return new
                {
                    Valid = false,
                    Message = "Coupon code is required."
                };
            }

            var couponCode = dto.CouponCode.Trim().ToUpper();

            var coupon = await _repository.GetCouponAsync(couponCode);

            if (coupon == null)
            {
                return new
                {
                    Valid = false,
                    Message = "Invalid coupon."
                };
            }

            // -----------------------------------------------------
            // EXPIRY CHECK
            // -----------------------------------------------------

            if (coupon.ExpiryDate < DateTime.UtcNow)
            {
                return new
                {
                    Valid = false,
                    Message = "This coupon has expired."
                };
            }

            decimal discount = 0;

            // -----------------------------------------------------
            // FIXED DISCOUNT
            // -----------------------------------------------------

            if (coupon.DiscountAmount.HasValue &&
                coupon.DiscountAmount.Value > 0)
            {
                discount = coupon.DiscountAmount.Value;
            }

            // -----------------------------------------------------
            // PERCENTAGE DISCOUNT
            // -----------------------------------------------------

            else if (coupon.DiscountPercentage > 0)
            {
                discount =
                    dto.Amount *
                    coupon.DiscountPercentage /
                    100;
            }

            // -----------------------------------------------------
            // SAFETY
            // -----------------------------------------------------

            if (discount > dto.Amount)
                discount = dto.Amount;

            discount = Math.Round(discount, 2);

            decimal finalAmount =
                Math.Round(dto.Amount - discount, 2);

            return new
            {
                Valid = true,
                CouponCode = couponCode,
                OriginalAmount = dto.Amount,
                Discount = discount,
                FinalAmount = finalAmount,
                Message = $"Coupon applied successfully. You saved ₹{discount:0.00}."
            };
        }

        // =========================================================
        // GET ORDER
        // =========================================================

        public async Task<Order?> GetOrderAsync(int id)
        {
            return await _repository.GetOrderByIdAsync(id);
        }

        // =========================================================
        // PAYMENT HISTORY
        // =========================================================

        public async Task<List<Payment>> GetPaymentHistoryAsync(int userId)
        {
            return await _repository.GetPaymentHistoryAsync(userId);
        }
    }
}