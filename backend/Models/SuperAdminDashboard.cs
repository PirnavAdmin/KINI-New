namespace TalentSphereAPI.Models.Dashboard
{
    public class SuperAdminDashboard
    {
        public int TotalOrganizations { get; set; }
        public int ActiveUsers { get; set; }
        public int TotalEmployees { get; set; }
        public int ActiveSubscriptions { get; set; }

        public List<OrganizationGrowth> OrganizationGrowth { get; set; } = new();
        public List<UserActivity> UserActivity { get; set; } = new();
    }

    public class OrganizationGrowth
    {
        public string Month { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class UserActivity
    {
        public string Date { get; set; } = string.Empty;
        public int ActiveCount { get; set; }
    }
}