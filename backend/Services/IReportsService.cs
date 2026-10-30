using TalentSphereAPI.DTOs.Reports;

namespace TalentSphereAPI.Services

{

    public interface IReportsService

    {

        Task<HrAnalyticsDto> GetHrAnalyticsAsync();

        Task<SkillsAnalyticsDto> GetSkillsAnalyticsAsync();

        Task<PerformanceAnalyticsDto> GetPerformanceAnalyticsAsync();

        Task<WorkforceAnalyticsDto> GetWorkforceAnalyticsAsync();

    }

}
