using System.Security.Claims;

namespace TalentSphereAPI.Services.Tenancy
{
    public class TenantContext : ITenantContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TenantContext(
            IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public int OrganizationId
        {
            get
            {
                var httpContext = _httpContextAccessor.HttpContext;

                if (httpContext == null)
                {
                    throw new UnauthorizedAccessException(
                        "HTTP context is unavailable.");
                }

                var user = httpContext.User;

                if (user.Identity?.IsAuthenticated != true)
                {
                    throw new UnauthorizedAccessException(
                        "User is not authenticated.");
                }

                var organizationClaim =
                    user.FindFirst("OrganizationId")?.Value
                    ?? user.FindFirst("organizationId")?.Value;

                if (!int.TryParse(
                        organizationClaim,
                        out var organizationId) ||
                    organizationId <= 0)
                {
                    throw new UnauthorizedAccessException(
                        "OrganizationId was not found in the authenticated token.");
                }

                return organizationId;
            }
        }
    }
}