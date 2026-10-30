namespace TalentSphereAPI.Models
{
    public class Permission
    {
        public int PermissionId { get; set; }

        public string Module { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public ICollection<RolePermission> RolePermissions { get; set; }
            = new List<RolePermission>();
    }
}