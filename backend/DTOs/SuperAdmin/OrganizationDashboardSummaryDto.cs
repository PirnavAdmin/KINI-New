namespace TalentSphereAPI.DTOs.SuperAdmin
{
    public class OrganizationDashboardSummaryDto
    {
        public int TotalOrganizations { get; set; }

        public int NewOrganizations { get; set; }

        public int ActiveSubscriptions { get; set; }

        public int ExpiringSubscriptions { get; set; }

        public int ExpiredSubscriptions { get; set; }
    }
}