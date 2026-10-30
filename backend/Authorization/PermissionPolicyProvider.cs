using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace TalentSphereAPI.Authorization
{
    public class PermissionPolicyProvider
        : DefaultAuthorizationPolicyProvider
    {
        public PermissionPolicyProvider(
            IOptions<AuthorizationOptions> options)
            : base(options)
        {
        }

        public override async Task<AuthorizationPolicy?>
            GetPolicyAsync(string policyName)
        {
            if (policyName.StartsWith(
                    "Permission:",
                    StringComparison.OrdinalIgnoreCase))
            {
                var parts = policyName.Split(':');

                if (parts.Length == 3)
                {
                    var module = parts[1];
                    var action = parts[2];

                    var policyBuilder =
                        new AuthorizationPolicyBuilder();

                    policyBuilder
                        .RequireAuthenticatedUser()
                        .AddRequirements(
                            new PermissionRequirement(
                                module,
                                action));

                    return policyBuilder.Build();
                }
            }

            return await base.GetPolicyAsync(policyName);
        }
    }
}