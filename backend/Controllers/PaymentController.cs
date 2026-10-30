using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs;
using TalentSphereAPI.DTOs.Payment;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/v1")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _service;

        public PaymentController(IPaymentService service)
        {
            _service = service;
        }
        [HttpPost("orders/create")]
        public async Task<IActionResult> CreateOrder(CreateOrderDto dto)
        {
            var result = await _service.CreateOrderAsync(dto);
            return Ok(result);
        }

        [HttpPost("payments/verify")]
        public async Task<IActionResult> VerifyPayment(VerifyPaymentDto dto)
        {
            var result = await _service.VerifyPaymentAsync(dto);

            if (!result)
                return BadRequest("Payment verification failed.");

            return Ok("Payment verified.");
        }

        [HttpPost("coupons/validate")]
        public async Task<IActionResult> ValidateCoupon(CouponDto dto)
        {
            var result = await _service.ValidateCouponAsync(dto);
            return Ok(result);
        }

        [HttpGet("orders/{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var order = await _service.GetOrderAsync(id);

            if (order == null)
                return NotFound();

            return Ok(order);
        }

        [HttpGet("payments/history")]
        public async Task<IActionResult> PaymentHistory(int userId)
        {
            var history = await _service.GetPaymentHistoryAsync(userId);
            return Ok(history);
        
        }
    }
}
