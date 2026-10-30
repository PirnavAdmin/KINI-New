namespace TalentSphereAPI.Models.Dashboard
{
    public class OrganizationAdminDashboard
    {
        public int EmployeeCount { get; set; }
        public int Departments { get; set; }
        public int SkillCoverage { get; set; }

        public List<GoalSummary> ActiveGoals { get; set; } = new();
        public List<PerformanceTrend> PerformanceTrend { get; set; } = new();
        public List<DepartmentDistribution> DepartmentDistribution { get; set; } = new();
    }

    public class GoalSummary
    {
        public string GoalName { get; set; } = string.Empty;
        public int EmployeeCount { get; set; }
    }

    public class PerformanceTrend
    {
        public string Month { get; set; } = string.Empty;
        public decimal Score { get; set; }
    }

    public class DepartmentDistribution
    {
        public string DepartmentName { get; set; } = string.Empty;
        public int EmployeeCount { get; set; }
    }
}