namespace TalentSphereAPI.Models
{
    /// <summary>Bound from the "PublicEnrollment" configuration section.</summary>
    public class PublicEnrollmentOptions
    {
        public const string SectionName = "PublicEnrollment";

        /// <summary>Frontend origin used in emailed links, e.g. https://kiniedx.com.</summary>
        public string? FrontendBaseUrl { get; set; }

        public int AccessTokenLifetimeDays { get; set; } = 30;

        public long MaxScreenshotBytes { get; set; } = 5 * 1024 * 1024;

        public int MaxApplicationsPerEmailPerDay { get; set; } = 5;

        public int MaxPaymentAttempts { get; set; } = 5;

        /// <summary>How many days back a payment date may be.</summary>
        public int MaxPaymentAgeDays { get; set; } = 30;

        public int PasswordSetupTokenLifetimeHours { get; set; } = 48;
    }
}
