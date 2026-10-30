using Microsoft.EntityFrameworkCore;

using TalentSphereAPI.Data;

using TalentSphereAPI.DTOs.Reports;

namespace TalentSphereAPI.Repositories

{

    public class ReportsRepository : IReportsRepository

    {

        private readonly ApplicationDbContext _context;

        public ReportsRepository(ApplicationDbContext context)

        {

            _context = context;

        }

        public async Task<HrAnalyticsDto> GetHrAnalyticsAsync()

        {

            return new HrAnalyticsDto

            {

                TotalEmployees = await _context.Users.CountAsync(),

                ActiveEmployees = await _context.Users.CountAsync(),

                TotalDepartments = await _context.Departments.CountAsync(),

                TotalTeams = await _context.Teams.CountAsync()

            };

        }

        public async Task<SkillsAnalyticsDto> GetSkillsAnalyticsAsync()

        {

            return new SkillsAnalyticsDto

            {

                TotalSkills = await _context.Skills.CountAsync(),

                TotalCompetencies = await _context.Competencies.CountAsync(),

                TotalRoles = await _context.Roles.CountAsync(),

                RoleCompetencies = await _context.RoleCompetencies.CountAsync()

            };

        }

        public Task<PerformanceAnalyticsDto> GetPerformanceAnalyticsAsync()
        {
            return Task.FromResult(new PerformanceAnalyticsDto
            {
                TotalEmployeesReviewed = 0,
                HighPerformers = 0,
                AveragePerformers = 0,
                LowPerformers = 0
            });
        }
        public async Task<WorkforceAnalyticsDto> GetWorkforceAnalyticsAsync()

        {

            return new WorkforceAnalyticsDto

            {

                TotalOrganizations = await _context.Organizations.CountAsync(),

                TotalBranches = await _context.Branches.CountAsync(),

                TotalDepartments = await _context.Departments.CountAsync(),

                TotalEmployees = await _context.Users.CountAsync()

            };

        }

    }

}
