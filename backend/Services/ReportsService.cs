using TalentSphereAPI.DTOs.Reports;

using TalentSphereAPI.Repositories;

namespace TalentSphereAPI.Services

{

    public class ReportsService : IReportsService

    {

        private readonly IReportsRepository _repository;

        public ReportsService(IReportsRepository repository)

        {

            _repository = repository;

        }

        public async Task<HrAnalyticsDto> GetHrAnalyticsAsync()

        {

            return await _repository.GetHrAnalyticsAsync();

        }

        public async Task<SkillsAnalyticsDto> GetSkillsAnalyticsAsync()

        {

            return await _repository.GetSkillsAnalyticsAsync();

        }

        public async Task<PerformanceAnalyticsDto> GetPerformanceAnalyticsAsync()

        {

            return await _repository.GetPerformanceAnalyticsAsync();

        }

        public async Task<WorkforceAnalyticsDto> GetWorkforceAnalyticsAsync()

        {

            return await _repository.GetWorkforceAnalyticsAsync();

        }

    }

}
