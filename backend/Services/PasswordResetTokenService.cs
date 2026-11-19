using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Helpers;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services
{
    public interface IPasswordResetTokenService
    {
        /// <summary>
        /// Issues a single-use reset token for the account behind a just-verified
        /// OTP. Returns null when no account uses this identifier.
        /// </summary>
        Task<(string Token, DateTime ExpiresAt)?> IssueAsync(string identifier, CancellationToken ct = default);

        /// <summary>Consumes the token and sets the new password in one SaveChanges (one transaction).</summary>
        Task<ApiResponseDto> ResetAsync(string identifier, string resetToken, string newPassword, CancellationToken ct = default);
    }

    /// <summary>
    /// Reset-only authorization for the two-screen forgot-password flow. The raw
    /// token is returned once by verify-otp; only its SHA-256 hash is stored
    /// (PasswordSetupTokens, Purpose = PasswordReset). It is not a login JWT.
    /// </summary>
    public class PasswordResetTokenService : IPasswordResetTokenService
    {
        public static readonly TimeSpan Lifetime = TimeSpan.FromMinutes(10);

        private readonly ApplicationDbContext _context;

        public PasswordResetTokenService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(string Token, DateTime ExpiresAt)?> IssueAsync(string identifier, CancellationToken ct = default)
        {
            var user = await FindUserAsync(identifier, ct);
            if (user == null)
                return null;

            var now = DateTime.UtcNow;

            // Only the newest reset authorization for this account works.
            var outstanding = await _context.PasswordSetupTokens
                .Where(t => t.UserId == user.UserId &&
                            t.Purpose == PasswordSetupTokenPurpose.PasswordReset &&
                            t.UsedAt == null && t.RevokedAt == null)
                .ToListAsync(ct);
            foreach (var old in outstanding)
                old.RevokedAt = now;

            var token = SecureTokenHelper.GenerateToken();
            var expiresAt = now.Add(Lifetime);
            _context.PasswordSetupTokens.Add(new PasswordSetupToken
            {
                UserId = user.UserId,
                TokenHash = SecureTokenHelper.Hash(token),
                Purpose = PasswordSetupTokenPurpose.PasswordReset,
                ExpiresAt = expiresAt,
                CreatedAt = now
            });
            await _context.SaveChangesAsync(ct);

            return (token, expiresAt);
        }

        public async Task<ApiResponseDto> ResetAsync(string identifier, string resetToken, string newPassword, CancellationToken ct = default)
        {
            static ApiResponseDto Fail(string message) => new() { Success = false, Message = message };
            const string invalid = "Password reset authorization is invalid or has expired. Please request a new code.";

            if (string.IsNullOrWhiteSpace(resetToken))
                return Fail(invalid);

            var hash = SecureTokenHelper.Hash(resetToken.Trim());
            var record = await _context.PasswordSetupTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.TokenHash == hash && t.Purpose == PasswordSetupTokenPurpose.PasswordReset, ct);

            var now = DateTime.UtcNow;
            if (record == null || record.UsedAt != null || record.RevokedAt != null ||
                record.ExpiresAt <= now || record.User.IsDeleted)
                return Fail(invalid);

            // The token is bound to its account: the identifier must be that account.
            var id = (identifier ?? string.Empty).Trim();
            var matches = string.Equals(record.User.Email, id, StringComparison.OrdinalIgnoreCase) ||
                          (!string.IsNullOrEmpty(record.User.Phone) && record.User.Phone == id);
            if (!matches)
                return Fail(invalid);

            record.UsedAt = now;
            record.User.PasswordHash = PasswordHelper.HashPassword(newPassword);

            var others = await _context.PasswordSetupTokens
                .Where(t => t.UserId == record.UserId && t.PasswordSetupTokenId != record.PasswordSetupTokenId &&
                            t.Purpose == PasswordSetupTokenPurpose.PasswordReset &&
                            t.UsedAt == null && t.RevokedAt == null)
                .ToListAsync(ct);
            foreach (var other in others)
                other.RevokedAt = now;

            try
            {
                // UsedAt is a concurrency token: a second concurrent reset with the
                // same token fails here and nothing of it is saved.
                await _context.SaveChangesAsync(ct);
            }
            catch (DbUpdateConcurrencyException)
            {
                return Fail(invalid);
            }

            return new ApiResponseDto { Success = true, Message = "Password reset successfully." };
        }

        private async Task<User?> FindUserAsync(string identifier, CancellationToken ct)
        {
            var id = (identifier ?? string.Empty).Trim();
            if (id.Length == 0)
                return null;

            var users = await _context.Users
                .Where(u => !u.IsDeleted && (u.Email == id || u.Phone == id))
                .Take(2)
                .ToListAsync(ct);
            // Ambiguous identifier: issue nothing rather than pick an account.
            return users.Count == 1 ? users[0] : null;
        }
    }
}
