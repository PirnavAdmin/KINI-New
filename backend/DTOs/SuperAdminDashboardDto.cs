namespace TalentSphereAPI.DTOs.Dashboard
{
    public class SuperAdminDashboardDto
    {
        public int TotalOrganizations { get; set; }
        public int ActiveUsers { get; set; }
        public int TotalEmployees { get; set; }
        public int ActiveSubscriptions { get; set; }

        public List<OrganizationGrowthDto> OrganizationGrowth { get; set; } = new();
        public List<UserActivityDto> UserActivity { get; set; } = new();
    }

    public class OrganizationGrowthDto
    {
        public string Month { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class UserActivityDto
    {
        public string Date { get; set; } = string.Empty;
        public int ActiveCount { get; set; }
    }
}