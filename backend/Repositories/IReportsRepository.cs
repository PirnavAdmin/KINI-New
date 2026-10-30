using TalentSphereAPI.DTOs.Reports;

namespace TalentSphereAPI.Repositories

{

    public interface IReportsRepository

    {

        Task<HrAnalyticsDto> GetHrAnalyticsAsync();

        Task<SkillsAnalyticsDto> GetSkillsAnalyticsAsync();

        Task<PerformanceAnalyticsDto> GetPerformanceAnalyticsAsync();

        Task<WorkforceAnalyticsDto> GetWorkforceAnalyticsAsync();

    }

}
