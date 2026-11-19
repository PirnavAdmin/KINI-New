using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.PublicEnrollment;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Helpers;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services
{
    public interface IPasswordSetupService
    {
        Task<PasswordSetupInfoDto> InspectAsync(string token, CancellationToken ct = default);
        Task CompleteAsync(CompletePasswordSetupDto dto, CancellationToken ct = default);
    }

    /// <summary>
    /// Single-use password setup for accounts provisioned by enrollment
    /// approval. After success the student signs in through the existing
    /// /api/Auth/login endpoint — no separate login path.
    /// </summary>
    public class PasswordSetupService : IPasswordSetupService
    {
        private readonly ApplicationDbContext _context;

        public PasswordSetupService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PasswordSetupInfoDto> InspectAsync(string token, CancellationToken ct = default)
        {
            var record = await FindValidAsync(token, tracking: false, ct);
            return new PasswordSetupInfoDto
            {
                FirstName = record.User.FirstName,
                MaskedEmail = MaskEmail(record.User.Email),
                ExpiresAt = record.ExpiresAt
            };
        }

        public async Task CompleteAsync(CompletePasswordSetupDto dto, CancellationToken ct = default)
        {
            var record = await FindValidAsync(dto.Token, tracking: true, ct);
            var now = DateTime.UtcNow;

            record.UsedAt = now;
            record.User.PasswordHash = PasswordHelper.HashPassword(dto.Password);
            // Opening the emailed link proves the student controls the address.
            record.User.IsEmailVerified = true;

            // Activate every approved enrollment waiting on this account.
            var applications = await _context.CourseEnrollments
                .Where(a =>
                    a.UserId == record.UserId &&
                    a.EnrollmentStatus == EnrollmentApplicationStatus.Approved &&
                    a.AccountStatus == EnrollmentAccountStatus.PendingSetup)
                .ToListAsync(ct);

            foreach (var application in applications)
            {
                EnrollmentWorkflow.Transition(_context, application,
                    action: "AccountActivated",
                    actor: $"User:{record.UserId}",
                    accountStatus: EnrollmentAccountStatus.Active);
            }

            // Any other outstanding setup links for this user stop working.
            var others = await _context.PasswordSetupTokens
                .Where(t => t.UserId == record.UserId && t.PasswordSetupTokenId != record.PasswordSetupTokenId &&
                            t.UsedAt == null && t.RevokedAt == null)
                .ToListAsync(ct);
            foreach (var other in others)
                other.RevokedAt = now;

            try
            {
                await _context.SaveChangesAsync(ct);
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new EnrollmentWorkflowException(409, "SETUP_LINK_USED",
                    "This setup link has already been used. Sign in with your password.");
            }
        }

        private async Task<PasswordSetupToken> FindValidAsync(string? token, bool tracking, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(token))
                throw Invalid();

            var hash = SecureTokenHelper.Hash(token.Trim());
            IQueryable<PasswordSetupToken> query = _context.PasswordSetupTokens.Include(t => t.User);
            if (!tracking) query = query.AsNoTracking();

            var record = await query.FirstOrDefaultAsync(t => t.TokenHash == hash, ct);

            // Forgot-password reset tokens share the table but never work here.
            if (record == null || record.Purpose != PasswordSetupTokenPurpose.InitialSetup ||
                record.RevokedAt != null || record.User.IsDeleted)
                throw Invalid();

            if (record.UsedAt != null)
                throw new EnrollmentWorkflowException(409, "SETUP_LINK_USED",
                    "This setup link has already been used. Sign in with your password.");

            if (record.ExpiresAt <= DateTime.UtcNow)
                throw new EnrollmentWorkflowException(410, "SETUP_LINK_EXPIRED",
                    "This setup link has expired. Ask the organization to resend it.");

            if (record.User.Role != UserRole.Student)
                throw Invalid();

            return record;
        }

        private static EnrollmentWorkflowException Invalid() =>
            new(404, "SETUP_LINK_INVALID", "This setup link is invalid. Use the latest link from your email.");

        private static string MaskEmail(string? email)
        {
            if (string.IsNullOrWhiteSpace(email) || !email.Contains('@')) return string.Empty;
            var at = email.IndexOf('@');
            var name = email[..at];
            var visible = name.Length <= 2 ? name[..1] : name[..2];
            return $"{visible}{new string('*', Math.Max(1, name.Length - visible.Length))}{email[at..]}";
        }
    }
}
