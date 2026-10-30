namespace TalentSphereAPI.Models

{

    public class SuperAdmin

    {

        public int SuperAdminId { get; set; }

        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

    }

}
