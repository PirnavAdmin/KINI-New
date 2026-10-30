using TalentSphereAPI.DTOs;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories
{
    public interface IAuthRepository
    {
        // ===========================
        // User Methods
        // ===========================
        Task CreateUserAsync(User user);
        Task<User?> LoginAsync(string identifier);

        Task<User?> GetByIdentifierAsync(string identifier);

        Task<bool> RegisterAsync(User user);

        Task<bool> EmailExistsAsync(string email);

        Task<bool> PhoneExistsAsync(string phone);

        // ===========================
        // OTP Methods
        // ===========================

        Task<bool> SaveOtpAsync(OtpVerification otpVerification);

        Task<OtpVerification?> GetOtpAsync(string identifier, string otpType);

        Task<bool> VerifyOtpAsync(
            string identifier,
            string otp,
            string otpType);

        Task<bool> DeleteOtpAsync(
            string identifier,
            string otpType);

        // ===========================
        // Password Methods
        // ===========================

        Task<bool> ResetPasswordAsync(
            string identifier,
            string newPassword);

        Task<bool> ChangePasswordAsync(
            int userId,
            string oldPassword,
            string newPassword);

        Task<bool> DeleteUserAsync(int userId);

        // ===========================
        // Profile Methods
        // ===========================

        Task<User?> GetUserByIdAsync(int userId);

        Task UpdateUserAsync(User user);
        Task<OtpVerification?> GetVerifiedOtpAsync(string identifier,string otpType);
        Task<List<ProfileResponseDto>> GetAllUsersAsync();

        Task<ProfileResponseDto?> GetProfileAsync(int userId);

        Task<Student?> GetStudentByEmailAsync(string email);

        Task<bool> UpdateProfileAsync(
            int userId,
            UpdateProfileDto dto);


        
    
    }
}