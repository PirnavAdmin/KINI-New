namespace TalentSphereAPI.Models
{
    public class MSG91Settings
    {
        public string AuthKey { get; set; } = string.Empty;

        public string SenderId { get; set; } = string.Empty;

        public string TemplateId { get; set; } = string.Empty;

        public string Route { get; set; } = "4";
    }
}