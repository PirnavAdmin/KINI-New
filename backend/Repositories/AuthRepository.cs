using Microsoft.EntityFrameworkCore;

using TalentSphereAPI.Data;

using TalentSphereAPI.DTOs;

using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories

{

    public class AuthRepository : IAuthRepository

    {

        private readonly ApplicationDbContext _context;

        public AuthRepository(ApplicationDbContext context)

        {

            _context = context;

        }

        public async Task CreateUserAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }
        public async Task<User?> LoginAsync(string identifier)
        {
            if (string.IsNullOrWhiteSpace(identifier))
                return null;

            identifier = identifier.Trim();

            return await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    !x.IsDeleted &&
                    (
                        x.Email == identifier ||
                        x.Phone == identifier
                    ));
        }
        public async Task<User?> GetByIdentifierAsync(string identifier)
        {
            if (string.IsNullOrWhiteSpace(identifier))
                return null;
            identifier = identifier.Trim();

            return await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    !x.IsDeleted &&
                    (
                        x.Email == identifier ||
                        x.Phone == identifier
                    ));
        }
        public async Task<bool> RegisterAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<bool> EmailExistsAsync(string email)
        {
            email = email.Trim().ToUpperInvariant();

            return await _context.Users
                .AnyAsync(x =>
                    x.Email != null &&
                    x.Email.ToUpper() == email);
        }
        public async Task<bool> PhoneExistsAsync(string phone)
        {
            return await _context.Users
                .AnyAsync(x => x.Phone == phone);
        }
        public async Task<bool> SaveOtpAsync(OtpVerification otpVerification)
        {
            var existingOtp = await _context.OtpVerifications
                .FirstOrDefaultAsync(x =>
                    x.Identifier == otpVerification.Identifier &&
                    x.OtpType == otpVerification.OtpType);

            if (existingOtp != null)
            {
                existingOtp.Otp = otpVerification.Otp;
                existingOtp.ExpiryTime = otpVerification.ExpiryTime;
                existingOtp.IsVerified = false;
                existingOtp.IsUsed = false;
                existingOtp.CreatedDate = DateTime.UtcNow;
            }
            else
            {
                await _context.OtpVerifications.AddAsync(otpVerification);
            }

            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<OtpVerification?> GetOtpAsync(
            string identifier,
            string otpType)
        {
            return await _context.OtpVerifications
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Identifier == identifier &&
                    x.OtpType == otpType);
                }

            public async Task<OtpVerification?> GetVerifiedOtpAsync(
    string identifier,
    string otpType)
        {
            return await _context.OtpVerifications
                .FirstOrDefaultAsync(x =>
                    x.Identifier == identifier &&
                    x.OtpType == otpType &&
                    x.IsVerified &&
                    !x.IsUsed &&
                    x.ExpiryTime > DateTime.UtcNow);
        }
        
        public async Task<bool> VerifyOtpAsync(
            string identifier,
            string otp,
            string otpType)
        {
            var otpRecord = await _context.OtpVerifications
                .FirstOrDefaultAsync(x =>
                    x.Identifier == identifier &&
                    x.OtpType == otpType);

            if (otpRecord == null)
                return false;

            if (otpRecord.IsVerified)
                return false;

            if (otpRecord.ExpiryTime < DateTime.UtcNow)
                return false;

            if (otpRecord.Otp != otp)
                return false;

            otpRecord.IsVerified = true;
            otpRecord.IsUsed = false;

            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<bool> DeleteOtpAsync(
            string identifier,
            string otpType)
        {
            var otpRecord = await _context.OtpVerifications
                .FirstOrDefaultAsync(x =>
                    x.Identifier == identifier &&
                    x.OtpType == otpType);

            if (otpRecord == null)
                return false;

            _context.OtpVerifications.Remove(otpRecord);

            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<bool> ResetPasswordAsync(
            string identifier,
            string newPassword)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x =>
                    x.Email == identifier ||
                    x.Phone == identifier);

            if (user == null)
                return false;

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> ChangePasswordAsync(
            int userId,
            string oldPassword,
            string newPassword)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (user == null)
                return false;

            if (!BCrypt.Net.BCrypt.Verify(oldPassword, user.PasswordHash))
                return false;

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<User?> GetUserByIdAsync(int userId)
        {
            return await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.UserId == userId && !x.IsDeleted);
        }

        public async Task UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }
        public async Task<List<ProfileResponseDto>> GetAllUsersAsync()
        {
            return await _context.Users
     .Where(x => !x.IsDeleted)
     .Select(x => new ProfileResponseDto
     {
         UserId = x.UserId,
         FirstName = x.FirstName,
         LastName = x.LastName,
         Email = x.Email ?? string.Empty,
         Phone = x.Phone ?? string.Empty
     })
     .ToListAsync();
        }
        public async Task<ProfileResponseDto?> GetProfileAsync(
    int userId)
        {
            // ============================================================
            // 1. GET USER
            // ============================================================

            var user =
                await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x =>
                        x.UserId == userId &&
                        !x.IsDeleted);

            if (user == null)
            {
                return null;
            }


            // ============================================================
            // 2. GET EMPLOYEE
            // ============================================================

            var employee =
                await _context.Employees
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x =>
                        x.UserId == user.UserId &&
                        !x.IsDeleted);


            // ============================================================
            // 3. GET MENTOR
            // ============================================================

            Mentor? mentor = null;

            if (employee != null)
            {
                mentor =
                    await _context.Mentors
                        .AsNoTracking()
                        .FirstOrDefaultAsync(x =>
                            x.EmployeeId ==
                                employee.EmployeeId &&
                            !x.IsDeleted);
            }


            // ============================================================
            // 4. GET STUDENT
            // ============================================================

            Student? student = null;

            if (!string.IsNullOrWhiteSpace(
                    user.Email))
            {
                student =
                    await _context.Students
                        .AsNoTracking()
                        .FirstOrDefaultAsync(x =>
                            x.Email == user.Email &&
                            !x.IsDeleted);
            }


            // ============================================================
            // 5. RESOLVE ORGANIZATION
            // ============================================================

            int? organizationId =
                employee?.OrganizationId > 0
                    ? employee.OrganizationId
                    : student?.OrganizationId > 0
                        ? student.OrganizationId
                        : user.OrganizationId;


            // ============================================================
            // 6. RESOLVE PHOTO
            // ============================================================

            string? profilePhotoUrl =
                employee?.ProfilePhotoUrl
                ?? student?.ProfilePhotoUrl;


            // ============================================================
            // 7. BUILD RESPONSE
            // ============================================================

            return new ProfileResponseDto
            {
                UserId =
                    user.UserId,

                FirstName =
                    user.FirstName,

                LastName =
                    user.LastName,

                Email =
                    user.Email ?? string.Empty,

                Phone =
                    user.Phone ?? string.Empty,

                OrganizationId =
                    organizationId,

                EmployeeId =
                    employee?.EmployeeId,

                MentorId =
                    mentor?.MentorId,

                Role =
                    user.Role.ToString(),

                ProfilePhotoUrl =
                    profilePhotoUrl
            };
        }
        public async Task<bool> DeleteUserAsync(int userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (user == null)
                return false;

            user.IsDeleted = true;
            user.DeletedOn = DateTime.UtcNow;
            user.DeletedBy = "Admin";

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<Student?> GetStudentByEmailAsync(string email)
        {
            return await _context.Students
                .FirstOrDefaultAsync(s => s.Email == email);
        }
        public async Task<bool> UpdateProfileAsync(
            int userId,
            UpdateProfileDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (user == null)
                return false;

            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Phone = dto.Phone;

            await _context.SaveChangesAsync();

            return true;
        }



    }
}