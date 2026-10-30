using TalentSphereAPI.DTOs;

using TalentSphereAPI.Models;

using TalentSphereAPI.Repositories;

namespace TalentSphereAPI.Services

{

    public class SkillService : ISkillService

    {

        private readonly ISkillRepository _repository;

        public SkillService(ISkillRepository repository)

        {

            _repository = repository;

        }

        public async Task<IEnumerable<SkillResponseDto>> GetAllAsync()

        {

            var skills = await _repository.GetAllAsync();

            return skills.Select(s => new SkillResponseDto

            {

                SkillId = s.SkillId,

                Name = s.Name,

                Category = s.Category,

                Type = s.Type

            });

        }

        public async Task<SkillResponseDto?> GetByIdAsync(int id)

        {

            var skill = await _repository.GetByIdAsync(id);

            if (skill == null)

                return null;

            return new SkillResponseDto

            {

                SkillId = skill.SkillId,

                Name = skill.Name,

                Category = skill.Category,

                Type = skill.Type

            };

        }

        public async Task CreateAsync(CreateSkillDto dto)

        {

            var skill = new Skill

            {

                Name = dto.Name,

                Category = dto.Category,

                Type = dto.Type

            };

            await _repository.AddAsync(skill);

            await _repository.SaveAsync();

        }

        public async Task<bool> UpdateAsync(int id, UpdateSkillDto dto)

        {

            var skill = await _repository.GetByIdAsync(id);

            if (skill == null)

                return false;

            skill.Name = dto.Name;

            skill.Category = dto.Category;

            skill.Type = dto.Type;

            _repository.Update(skill);

            await _repository.SaveAsync();

            return true;

        }

        public async Task<bool> DeleteAsync(int id)

        {

            var skill = await _repository.GetByIdAsync(id);

            if (skill == null)

                return false;

            _repository.Delete(skill);

            await _repository.SaveAsync();

            return true;

        }

    }

}
