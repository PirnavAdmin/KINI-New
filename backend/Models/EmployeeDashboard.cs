namespace TalentSphereAPI.Models.Dashboard
{
    public class EmployeeDashboard
    {
        public List<string> MySkills { get; set; } = new();
        public List<string> MyGoals { get; set; } = new();

        public decimal PerformanceScore { get; set; }

        public string CareerPath { get; set; } = string.Empty;
    }
}