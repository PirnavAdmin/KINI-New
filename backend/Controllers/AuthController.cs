using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TalentSphereAPI.DTOs;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // ===========================
        // Register
        // ===========================

        [HttpPost("register")]
        public async Task<IActionResult> Register(
     [FromBody] RegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ===========================
        // Login
        // ===========================

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var result = await _authService.LoginAsync(dto);

            if (!result.Success)
                return Unauthorized(result);

            return Ok(result);
        }

        // ===========================
        // Send OTP
        // ===========================

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp(SendOtpDto dto)
        {
            var result = await _authService.SendOtpAsync(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ===========================
        // Verify OTP
        // ===========================

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp(VerifyOtpDto dto)
        {
            var result = await _authService.VerifyOtpAsync(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ===========================
        // Forgot Password
        // ===========================

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
        {
            var result = await _authService.ForgotPasswordAsync(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ===========================
        // Reset Password
        // ===========================

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
        {
            var result = await _authService.ResetPasswordAsync(dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ===========================
        // Change Password
        // ===========================


        [HttpPost("change-password/{userId}")]
        public async Task<IActionResult> ChangePassword(int userId, ChangePasswordDto dto)
        {
            var result = await _authService.ChangePasswordAsync(userId, dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        // ===========================
        // Get Profile
        // ===========================


        [HttpGet("profile/{userId}")]
        public async Task<IActionResult> GetProfile(int userId)
        {
            var profile = await _authService.GetProfileAsync(userId);

            if (profile == null)
                return NotFound(new
                {
                    Success = false,
                    Message = "User not found."
                });

            return Ok(profile);
        }
        // ===========================
        // Update Profile
        // ===========================


        [HttpPut("profile/{userId}")]
        public async Task<IActionResult> UpdateProfile(int userId, UpdateProfileDto dto)
        {
            var result = await _authService.UpdateProfileAsync(userId, dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ===========================
        // Get All Users
        // ===========================

        [HttpDelete("delete-user/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var result = await _authService.DeleteUserAsync(id);

            if (!result)
                return NotFound("User not found.");

            return Ok("User moved to Recycle Bin successfully.");
        }
        


        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _authService.GetAllUsersAsync();

            return Ok(users);
        }
    }
}