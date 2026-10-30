namespace TalentSphereAPI.DTOs.Permissions
{
    public class PermissionDto
    {
        public int PermissionId { get; set; }

        public string Module { get; set; } = string.Empty;

        public bool CanView { get; set; }

        public bool CanAdd { get; set; }

        public bool CanEdit { get; set; }

        public bool CanDelete { get; set; }

        public bool CanAccess { get; set; }
    }
}