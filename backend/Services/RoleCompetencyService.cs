using TalentSphereAPI.DTOs;

using TalentSphereAPI.Models;

using TalentSphereAPI.Repositories;

namespace TalentSphereAPI.Services

{

    public class RoleCompetencyService

        : IRoleCompetencyService

    {

        private readonly IRoleCompetencyRepository _repository;

        public RoleCompetencyService(

            IRoleCompetencyRepository repository)

        {

            _repository = repository;

        }

        public async Task<IEnumerable<RoleCompetencyDto>>

            GetAllAsync()

        {

            var data = await _repository.GetAllAsync();

            return data.Select(x => new RoleCompetencyDto

            {

                RoleName = x.Role!.RoleName,

                CompetencyName = x.Competency!.CompetencyName,

                RequiredLevel = x.RequiredLevel

            });

        }

        public async Task<RoleCompetencyDto?> GetByIdAsync(int id)

        {

            var item = await _repository.GetByIdAsync(id);

            if (item == null)

                return null;

            return new RoleCompetencyDto

            {

                RoleName = item.Role!.RoleName,

                CompetencyName = item.Competency!.CompetencyName,

                RequiredLevel = item.RequiredLevel

            };

        }

        public async Task CreateAsync(

            CreateRoleCompetencyDto dto)

        {

            var entity = new RoleCompetency

            {

                RoleId = dto.RoleId,

                CompetencyId = dto.CompetencyId,

                RequiredLevel = dto.RequiredLevel

            };

            await _repository.AddAsync(entity);

            await _repository.SaveAsync();

        }

        public async Task<bool> UpdateAsync(

            int id,

            UpdateRoleCompetencyDto dto)

        {

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null)

                return false;

            entity.RoleId = dto.RoleId;

            entity.CompetencyId = dto.CompetencyId;

            entity.RequiredLevel = dto.RequiredLevel;

            _repository.Update(entity);

            await _repository.SaveAsync();

            return true;

        }

        public async Task<bool> DeleteAsync(int id)

        {

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null)

                return false;

            _repository.Delete(entity);

            await _repository.SaveAsync();

            return true;

        }

    }

}
