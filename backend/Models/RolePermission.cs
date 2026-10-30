namespace TalentSphereAPI.Models
{
    public class RolePermission
    {
        public int RolePermissionId { get; set; }

        public UserRole Role { get; set; }

        // NULL = platform/default permission.
        // Value = organization-specific role permission.
        public int? OrganizationId { get; set; }

        public Organization? Organization { get; set; }

        public int PermissionId { get; set; }

        public Permission Permission { get; set; } = null!;

        public bool CanView { get; set; }

        public bool CanAdd { get; set; }

        public bool CanEdit { get; set; }

        public bool CanDelete { get; set; }

        public bool CanAccess { get; set; }
    }
}