using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services
{
    /// <summary>The authenticated organization-side caller, resolved from the database.</summary>
    /// <summary>UserId is set when the caller is a Users row (null for the organization owner login).</summary>
    public sealed record OrganizationActor(int OrganizationId, string Actor, bool IsOrganizationAdmin, int? UserId = null);

    public interface IOrganizationActorResolver
    {
        /// <summary>
        /// Resolves the caller's organization from the database, never from the
        /// OrganizationId claim alone. Throws 403 when the caller is not an
        /// active member of an organization.
        /// </summary>
        Task<OrganizationActor> ResolveAsync(ClaimsPrincipal user, CancellationToken ct = default);
    }

    public class OrganizationActorResolver : IOrganizationActorResolver
    {
        private readonly ApplicationDbContext _context;

        public OrganizationActorResolver(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<OrganizationActor> ResolveAsync(ClaimsPrincipal user, CancellationToken ct = default)
        {
            var role = user.FindFirst(ClaimTypes.Role)?.Value;
            var idValue = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var claimOrgValue = user.FindFirst("OrganizationId")?.Value;

            if (!int.TryParse(idValue, out var subjectId))
                throw Forbidden();

            // Organization owner login: the token subject is the Organization itself.
            if (string.Equals(role, "OrganizationAdmin", StringComparison.OrdinalIgnoreCase))
            {
                var exists = await _context.Organizations.AsNoTracking()
                    .AnyAsync(o => o.OrganizationId == subjectId, ct);

                if (!exists || (int.TryParse(claimOrgValue, out var claimed) && claimed != subjectId))
                    throw Forbidden();

                return new OrganizationActor(subjectId, $"OrganizationAdmin:{subjectId}", true);
            }

            // Any other organization user: membership comes from the Users row.
            var dbUser = await _context.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == subjectId && !u.IsDeleted, ct);

            if (dbUser?.OrganizationId is not int organizationId ||
                dbUser.Role is UserRole.Student or UserRole.SuperAdmin)
            {
                throw Forbidden();
            }

            if (int.TryParse(claimOrgValue, out var claimedOrg) && claimedOrg != organizationId)
                throw Forbidden();

            return new OrganizationActor(
                organizationId,
                $"User:{dbUser.UserId}",
                dbUser.Role == UserRole.Organization,
                dbUser.UserId);
        }

        private static EnrollmentWorkflowException Forbidden() =>
            new(403, "ORGANIZATION_ACCESS_DENIED", "You do not have access to this organization's enrollments.");
    }
}
