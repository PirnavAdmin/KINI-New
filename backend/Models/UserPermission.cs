namespace TalentSphereAPI.Models
{
    public class UserPermission
    {
        public int UserPermissionId { get; set; }

        // User who receives the custom permission
        public int UserId { get; set; }

        // Permission/module
        public int PermissionId { get; set; }

        // Custom permission values
        public bool CanView { get; set; }

        public bool CanAdd { get; set; }

        public bool CanEdit { get; set; }

        public bool CanDelete { get; set; }

        public bool CanAccess { get; set; }

        // Navigation properties
        public User User { get; set; } = null!;

        public Permission Permission { get; set; } = null!;
    }
}