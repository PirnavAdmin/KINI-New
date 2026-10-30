using TalentSphereAPI.DTOs;

using TalentSphereAPI.Models;

using TalentSphereAPI.Repositories;

namespace TalentSphereAPI.Services

{

    public class CompetencyService : ICompetencyService

    {

        private readonly ICompetencyRepository _repository;

        public CompetencyService(ICompetencyRepository repository)

        {

            _repository = repository;

        }

        public async Task<IEnumerable<CompetencyResponseDto>> GetAllAsync()

        {

            var competencies = await _repository.GetAllAsync();

            return competencies.Select(c => new CompetencyResponseDto

            {

                CompetencyId = c.CompetencyId,

                CompetencyName = c.CompetencyName,

                Description = c.Description

            });

        }

        public async Task<CompetencyResponseDto?> GetByIdAsync(int id)

        {

            var competency = await _repository.GetByIdAsync(id);

            if (competency == null)

                return null;

            return new CompetencyResponseDto

            {

                CompetencyId = competency.CompetencyId,

                CompetencyName = competency.CompetencyName,

                Description = competency.Description

            };

        }

        public async Task CreateAsync(CreateCompetencyDto dto)

        {

            var competency = new Competency

            {

                CompetencyName = dto.CompetencyName,

                Description = dto.Description

            };

            await _repository.AddAsync(competency);

            await _repository.SaveAsync();

        }

        public async Task<bool> UpdateAsync(int id, UpdateCompetencyDto dto)

        {

            var competency = await _repository.GetByIdAsync(id);

            if (competency == null)

                return false;

            competency.CompetencyName = dto.CompetencyName;

            competency.Description = dto.Description;

            _repository.Update(competency);

            await _repository.SaveAsync();

            return true;

        }

        public async Task<bool> DeleteAsync(int id)

        {

            var competency = await _repository.GetByIdAsync(id);

            if (competency == null)

                return false;

            _repository.Delete(competency);

            await _repository.SaveAsync();

            return true;

        }

        // Dashboard

        public async Task<CompetencyDashboardDto> GetDashboardAsync()

        {

            return new CompetencyDashboardDto

            {

                TotalCompetencies = await _repository.GetCompetencyCountAsync(),

                TotalRoles = await _repository.GetRoleCountAsync(),

                TotalRoleCompetencies = await _repository.GetRoleCompetencyCountAsync()

            };

        }

        // Role Competencies

        public async Task<List<RoleCompetencyDto>> GetRoleCompetenciesAsync(int roleId)

        {

            var roleCompetencies =

                await _repository.GetRoleCompetenciesAsync(roleId);

            return roleCompetencies.Select(rc => new RoleCompetencyDto

            {

                RoleName = rc.Role!.RoleName,

                CompetencyName = rc.Competency!.CompetencyName,

                RequiredLevel = rc.RequiredLevel

            }).ToList();

        }

    }

}
