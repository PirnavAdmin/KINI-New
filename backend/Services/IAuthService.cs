using TalentSphereAPI.DTOs;

namespace TalentSphereAPI.Services.Interfaces
{
    public interface IAuthService
    {
        // ===========================
        // Authentication
        // ===========================

        Task<LoginResponseDto> RegisterAsync(RegisterDto dto);

        Task<LoginResponseDto> LoginAsync(LoginDto loginDto);

        // ===========================
        // OTP
        // ===========================

        Task<ApiResponseDto> SendOtpAsync(SendOtpDto sendOtpDto);

        Task<ApiResponseDto> VerifyOtpAsync(VerifyOtpDto verifyOtpDto);

        // ===========================
        // Password
        // ===========================

        Task<ApiResponseDto> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto);

        Task<ApiResponseDto> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);

        Task<ApiResponseDto> ChangePasswordAsync(
            int userId,
            ChangePasswordDto changePasswordDto);

        // ===========================
        // Profile
        // ===========================

        Task<List<ProfileResponseDto>> GetAllUsersAsync();

        Task<ProfileResponseDto?> GetProfileAsync(int userId);

        Task<ApiResponseDto> UpdateProfileAsync(
            int userId,
            UpdateProfileDto dto);
        Task<bool> DeleteUserAsync(int userId);
    }
}