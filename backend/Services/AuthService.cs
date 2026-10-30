

using TalentSphereAPI.DTOs;
using TalentSphereAPI.Helpers;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories;
using TalentSphereAPI.Services;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IJwtService _jwtService;
        private readonly IEmailService _emailService;
        private readonly ISmsService _smsService;

        public AuthService(
            IAuthRepository authRepository,
            IJwtService jwtService,
            IEmailService emailService,
            ISmsService smsService)
        {
            _authRepository = authRepository;
            _jwtService = jwtService;
            _emailService = emailService;
            _smsService = smsService;
        }
        private static string GenerateOtp()
        {
            return Random.Shared.Next(100000, 999999).ToString();
        }


        public async Task<LoginResponseDto> RegisterAsync(RegisterDto dto)
        {
            // ===========================
            // Check Duplicate Email
            // ===========================
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                if (await _authRepository.EmailExistsAsync(dto.Email))
                {
                    return new LoginResponseDto
                    {
                        Success = false,
                        Message = "Email already exists."
                    };
                }
            }

            // ===========================
            // Check Duplicate Phone
            // ===========================
            if (!string.IsNullOrWhiteSpace(dto.Phone))
            {
                if (await _authRepository.PhoneExistsAsync(dto.Phone))
                {
                    return new LoginResponseDto
                    {
                        Success = false,
                        Message = "Phone number already exists."
                    };
                }
            }

            // ===========================
            // Check Verified OTP
            // ===========================
            string identifier = !string.IsNullOrWhiteSpace(dto.Email)
                ? dto.Email.Trim()
                : dto.Phone!.Trim();

            string otpType = !string.IsNullOrWhiteSpace(dto.Email)
                ? "Email"
                : "Mobile";

            var verifiedOtp = await _authRepository.GetVerifiedOtpAsync(
                identifier,
                otpType);

            if (verifiedOtp == null)
            {
                return new LoginResponseDto
                {
                    Success = false,
                    Message = "Please verify OTP before registration."
                };
            }

            // ===========================
            // Create User
            // ===========================
            var user = new User
            {
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),

                Email = string.IsNullOrWhiteSpace(dto.Email)
                            ? null
                            : dto.Email.Trim(),

                Phone = string.IsNullOrWhiteSpace(dto.Phone)
                            ? null
                            : dto.Phone.Trim(),

                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),

                Role = dto.Role,

                IsEmailVerified = !string.IsNullOrWhiteSpace(dto.Email),

                IsPhoneVerified = !string.IsNullOrWhiteSpace(dto.Phone),

                CreatedDate = DateTime.UtcNow
            };

            var result = await _authRepository.RegisterAsync(user);

            if (!result)
            {
                return new LoginResponseDto
                {
                    Success = false,
                    Message = "Registration failed."
                };
            }

            // Remove OTP after successful registration
            await _authRepository.DeleteOtpAsync(identifier, otpType);

            return new LoginResponseDto
            {
                Success = true,
                Message = "Registration completed successfully."
            };
        }

      
public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
        {
            // ============================================================
            // 1. Validate Identifier
            // ============================================================

            if (string.IsNullOrWhiteSpace(dto.Identifier))
            {
                return new LoginResponseDto
                {
                    Success = false,
                    Message = "Email or phone is required."
                };
            }

            // ============================================================
            // 2. Validate Password
            // ============================================================

            if (string.IsNullOrWhiteSpace(dto.Password))
            {
                return new LoginResponseDto
                {
                    Success = false,
                    Message = "Password is required."
                };
            }

            // ============================================================
            // 3. Clean Identifier
            // ============================================================

            var identifier = dto.Identifier.Trim();

            // ============================================================
            // 4. Find User
            // ============================================================

            var user =
                await _authRepository.GetByIdentifierAsync(
                    identifier);

            if (user == null)
            {
                return new LoginResponseDto
                {
                    Success = false,
                    Message = "Invalid credentials."
                };
            }

            // ============================================================
            // 5. Check Deleted User
            // ============================================================

            if (user.IsDeleted)
            {
                return new LoginResponseDto
                {
                    Success = false,
                    Message = "This account has been deleted."
                };
            }

            // ============================================================
            // 6. Check Password
            // ============================================================

            bool passwordValid;

            try
            {
                passwordValid =
                    PasswordHelper.VerifyPassword(
                        dto.Password,
                        user.PasswordHash);
            }
            catch
            {
                passwordValid = false;
            }

            if (!passwordValid)
            {
                return new LoginResponseDto
                {
                    Success = false,
                    Message = "Invalid credentials."
                };
            }

            // ============================================================
            // 7. Resolve Student ID
            // ============================================================
            //
            // Users.UserId and Students.StudentId are different IDs.
            //
            // Example:
            // Users.UserId       = 15
            // Students.StudentId = 5
            //
            // We keep UserId as the universal JWT identity and add
            // StudentId as a separate claim for Student accounts.
            // ============================================================

            int? studentId = null;

            if (user.Role.ToString().Equals(
                "Student",
                StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrWhiteSpace(user.Email))
                {
                    return new LoginResponseDto
                    {
                        Success = false,
                        Message = "Student email is missing."
                    };
                }

                var student =
                    await _authRepository.GetStudentByEmailAsync(
                        user.Email.Trim());

                if (student == null)
                {
                    return new LoginResponseDto
                    {
                        Success = false,
                        Message =
                            "Student profile was not found for this account."
                    };
                }

                if (student.IsDeleted)
                {
                    return new LoginResponseDto
                    {
                        Success = false,
                        Message =
                            "The student profile has been deleted."
                    };
                }

                studentId = student.StudentId;
            }

            // ============================================================
            // 8. Generate JWT
            // ============================================================

            var token =
                _jwtService.GenerateToken(
                    user.UserId,
                    user.Email ?? user.Phone ?? string.Empty,
                    user.Role.ToString(),
                    user.OrganizationId,
                    studentId);

            // ============================================================
            // 9. Return Login Response
            // ============================================================

            return new LoginResponseDto
            {
                Success = true,
                Message = "Login successful.",
                Token = token,
                Role = user.Role.ToString(),

                // This remains UserId.
                // Do NOT change this to StudentId.
                UserId = user.UserId,

                Name = $"{user.FirstName} {user.LastName}",
                Email = user.Email ?? string.Empty
            };
        }

        public async Task<ApiResponseDto> SendOtpAsync(SendOtpDto dto)
        {
            // Generate 6-digit OTP
            var otp = new Random().Next(100000, 999999).ToString();

            var otpVerification = new OtpVerification
            {
                Identifier = dto.Identifier.Trim(),
                OtpType = dto.OtpType.Trim(),
                Otp = otp,
                ExpiryTime = DateTime.UtcNow.AddMinutes(5),
                IsVerified = false,
                CreatedDate = DateTime.UtcNow
            };

            var saved = await _authRepository.SaveOtpAsync(otpVerification);

            if (!saved)
            {
                return new ApiResponseDto
                {
                    Success = false,
                    Message = "Unable to generate OTP."
                };
            }

            if (dto.OtpType.Equals("Email", StringComparison.OrdinalIgnoreCase))
            {
                await _emailService.SendOtpAsync(dto.Identifier, otp);
            }
            else if (dto.OtpType.Equals("Mobile", StringComparison.OrdinalIgnoreCase))
            {
                await _smsService.SendOtpAsync(dto.Identifier, otp);
            }
            else
            {
                return new ApiResponseDto
                {
                    Success = false,
                    Message = "Invalid OTP type."
                };
            }

            return new ApiResponseDto
            {
                Success = true,
                Message = "OTP sent successfully."
            };
        }
        public async Task<ApiResponseDto> VerifyOtpAsync(VerifyOtpDto dto)
        {
            var otpRecord = await _authRepository.GetOtpAsync(
                dto.Identifier,
                dto.OtpType);

            if (otpRecord == null)
            {
                return new ApiResponseDto
                {
                    Success = false,
                    Message = "OTP not found."
                };
            }

            if (otpRecord.IsVerified)
            {
                return new ApiResponseDto
                {
                    Success = false,
                    Message = "OTP is already verified."
                };
            }

            if (otpRecord.ExpiryTime < DateTime.UtcNow)
            {
                return new ApiResponseDto
                {
                    Success = false,
                    Message = "OTP has expired."
                };
            }

            if (otpRecord.Otp != dto.Otp)
            {
                return new ApiResponseDto
                {
                    Success = false,
                    Message = "Invalid OTP."
                };
            }

            var verified = await _authRepository.VerifyOtpAsync(
                dto.Identifier,
                dto.Otp,
                dto.OtpType);

            if (!verified)
            {
                return new ApiResponseDto
                {
                    Success = false,
                    Message = "OTP verification failed."
                };
            }

            return new ApiResponseDto
            {
                Success = true,
                Message = "OTP verified successfully."
            };
        }
        public async Task<ApiResponseDto> ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            // Check whether the user exists
            var user = await _authRepository.GetByIdentifierAsync(dto.Identifier);

            if (user == null)
            {
                return new ApiResponseDto
                {
                    Success = false,
                    Message = "User not found."
                };
            }

            // Generate OTP
            var otp = GenerateOtp();

            var otpVerification = new OtpVerification
            {
                Identifier = dto.Identifier.Trim(),
                OtpType = dto.OtpType.Trim(),
                Otp = otp,
                ExpiryTime = DateTime.UtcNow.AddMinutes(5),
                IsVerified = false,
                CreatedDate = DateTime.UtcNow
            };

            // Save OTP
            var saved = await _authRepository.SaveOtpAsync(otpVerification);

            if (!saved)
            {
                return new ApiResponseDto
                {
                    Success = false,
                    Message = "Failed to generate OTP."
                };
            }

            // Send OTP
            if (dto.OtpType.Equals("Email", StringComparison.OrdinalIgnoreCase))
            {
                await _emailService.SendOtpAsync(dto.Identifier, otp);
            }
            else if (dto.OtpType.Equals("Mobile", StringComparison.OrdinalIgnoreCase))
            {
                await _smsService.SendOtpAsync(dto.Identifier, otp);
            }
            else
            {
                return new ApiResponseDto
                {
                    Success = false,
                    Message = "Invalid OTP Type."
                };
            }

            return new ApiResponseDto
            {
                Success = true,
                Message = "OTP sent successfully."
            };
        }
        public async Task<ApiResponseDto> ResetPasswordAsync(ResetPasswordDto dto)
        {
            // Check Password and Confirm Password
            if (dto.NewPassword != dto.ConfirmPassword)
            {
                return new ApiResponseDto
                {
                    Success = false,
                    Message = "New Password and Confirm Password do not match."
                };
            }

            // Get OTP Record
            var otpRecord = await _authRepository.GetOtpAsync(
                dto.Identifier,
               dto.OtpType);

            if (otpRecord == null)
            {
                return new ApiResponseDto
                {
                    Success = false,
                    Message = "OTP not found."
                };
            }

            // OTP Already Used
            if (otpRecord.IsVerified)
            {
                return new ApiResponseDto
                {
                    Success = false,
                    Message = "OTP has already been used."
                };
            }

            // OTP Expired
            if (otpRecord.ExpiryTime < DateTime.UtcNow)
            {
                return new ApiResponseDto
                {
                    Success = false,
                    Message = "OTP has expired."
                };
            }

            // OTP Mismatch
            if (otpRecord.Otp != dto.Otp)
            {
                return new ApiResponseDto
                {
                    Success = false,
                    Message = "Invalid OTP."
                };
            }

            // Mark OTP Verified
            await _authRepository.VerifyOtpAsync(
                dto.Identifier,
                dto.Otp,
                otpRecord.OtpType);

            // Reset Password
            var updated = await _authRepository.ResetPasswordAsync(
                dto.Identifier,
                dto.NewPassword);

            if (!updated)
            {
                return new ApiResponseDto
                {
                    Success = false,
                    Message = "Password reset failed."
                };
            }

            // Delete OTP
            await _authRepository.DeleteOtpAsync(
                dto.Identifier,
                otpRecord.OtpType);

            return new ApiResponseDto
            {
                Success = true,
                Message = "Password reset successfully."
            };
        }
        public async Task<ApiResponseDto> ChangePasswordAsync(
            int userId,
            ChangePasswordDto dto)
        {
            if (dto.NewPassword != dto.ConfirmPassword)
            {
                return new ApiResponseDto
                {
                    Success = false,
                    Message = "New Password and Confirm Password do not match."
                };
            }

            var result = await _authRepository.ChangePasswordAsync(
                userId,
                dto.OldPassword,
                dto.NewPassword);

            if (!result)
            {
                return new ApiResponseDto
                {
                    Success = false,
                    Message = "Old password is incorrect."
                };
            }

            return new ApiResponseDto
            {
                Success = true,
                Message = "Password changed successfully."
            };
        }
        public async Task<List<ProfileResponseDto>> GetAllUsersAsync()
        {
            return await _authRepository.GetAllUsersAsync();
        }
        public async Task<ProfileResponseDto?> GetProfileAsync(int userId)
        {
            return await _authRepository.GetProfileAsync(userId);
        }
        public async Task<bool> DeleteUserAsync(int userId)
        {
            return await _authRepository.DeleteUserAsync(userId);
        }
        public async Task<ApiResponseDto> UpdateProfileAsync(
            int userId,
            UpdateProfileDto dto)
        {
            var updated = await _authRepository.UpdateProfileAsync(
                userId,
                dto);

            if (!updated)
            {
                return new ApiResponseDto
                {
                    Success = false,
                    Message = "User not found."
                };
            }

            return new ApiResponseDto
            {
                Success = true,
                Message = "Profile updated successfully."
            };
        }
    }
}
