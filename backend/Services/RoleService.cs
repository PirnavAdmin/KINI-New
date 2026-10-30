using TalentSphereAPI.DTOs.Role;
using TalentSphereAPI.Models;

using TalentSphereAPI.Repositories;

namespace TalentSphereAPI.Services

{

    public class RoleService : IRoleService

    {

        private readonly IRoleRepository _repository;

        public RoleService(IRoleRepository repository)

        {

            _repository = repository;

        }

        public async Task<IEnumerable<RoleResponseDto>> GetAllAsync()

        {

            var roles = await _repository.GetAllAsync();

            return roles.Select(r => new RoleResponseDto

            {

                RoleId = r.RoleId,

                RoleName = r.RoleName,

                Description = r.Description

            });

        }

        public async Task<RoleResponseDto?> GetByIdAsync(int id)

        {

            var role = await _repository.GetByIdAsync(id);

            if (role == null)

                return null;

            return new RoleResponseDto

            {

                RoleId = role.RoleId,

                RoleName = role.RoleName,

                Description = role.Description

            };

        }

        public async Task CreateAsync(CreateRoleDto dto)

        {

            var role = new Role

            {

                RoleName = dto.RoleName,

                Description = dto.Description

            };

            await _repository.AddAsync(role);

            await _repository.SaveAsync();

        }

        public async Task<bool> UpdateAsync(int id, UpdateRoleDto dto)

        {

            var role = await _repository.GetByIdAsync(id);

            if (role == null)

                return false;

            role.RoleName = dto.RoleName;

            role.Description = dto.Description;

            _repository.Update(role);

            await _repository.SaveAsync();

            return true;

        }

        public async Task<bool> DeleteAsync(int id)

        {

            var role = await _repository.GetByIdAsync(id);

            if (role == null)

                return false;

            _repository.Delete(role);

            await _repository.SaveAsync();

            return true;

        }

    }

}
