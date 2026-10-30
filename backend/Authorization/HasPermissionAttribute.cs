using Microsoft.AspNetCore.Authorization;

namespace TalentSphereAPI.Authorization
{
    [AttributeUsage(
        AttributeTargets.Class |
        AttributeTargets.Method,
        AllowMultiple = true)]
    public class HasPermissionAttribute : AuthorizeAttribute
    {
        public HasPermissionAttribute(
            string module,
            string action)
        {
            Policy = $"Permission:{module}:{action}";
        }
    }
}