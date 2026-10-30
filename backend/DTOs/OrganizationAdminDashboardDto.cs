namespace TalentSphereAPI.DTOs.Dashboard
{
    public class OrganizationAdminDashboardDto
    {
        public int EmployeeCount { get; set; }
        public int Departments { get; set; }
        public int SkillCoverage { get; set; }

        public List<GoalSummaryDto> ActiveGoals { get; set; } = new();
        public List<PerformanceTrendDto> PerformanceTrend { get; set; } = new();
        public List<DepartmentDistributionDto> DepartmentDistribution { get; set; } = new();
    }

    public class GoalSummaryDto
    {
        public string GoalName { get; set; } = string.Empty;
        public int EmployeeCount { get; set; }
    }

    public class PerformanceTrendDto
    {
        public string Month { get; set; } = string.Empty;
        public decimal Score { get; set; }
    }

    public class DepartmentDistributionDto
    {
        public string DepartmentName { get; set; } = string.Empty;
        public int EmployeeCount { get; set; }
    }
}