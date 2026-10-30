namespace TalentSphereAPI.Models
{
    public class ChangePasswordModel
    {
        public string OldPassword { get; set; } = string.Empty;

        public string NewPassword { get; set; } = string.Empty;
    }
}