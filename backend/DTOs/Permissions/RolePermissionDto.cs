using TalentSphereAPI.Models;

namespace TalentSphereAPI.DTOs.Permissions
{
    public class RolePermissionDto
    {
        public int PermissionId { get; set; }

        public string Module { get; set; } = string.Empty;

        public UserRole Role { get; set; }

        public int OrganizationId { get; set; }

        public bool CanView { get; set; }

        public bool CanAdd { get; set; }

        public bool CanEdit { get; set; }

        public bool CanDelete { get; set; }

        public bool CanAccess { get; set; }
    }
}