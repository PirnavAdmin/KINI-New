using TalentSphereAPI.DTOs.Team;

using TalentSphereAPI.Models;

using TalentSphereAPI.Repositories;

namespace TalentSphereAPI.Services

{

    public class TeamService : ITeamService

    {

        private readonly ITeamRepository _repo;

        public TeamService(ITeamRepository repo)

        {

            _repo = repo;

        }

        public async Task<string> AddTeamAsync(CreateTeamDto dto)

        {

            var team = new Team

            {

                Name = dto.Name,

                DepartmentId = dto.DepartmentId,

                ManagerId = dto.ManagerId

            };

            var result = await _repo.AddAsync(team);

            return result ? "Team Created Successfully" : "Failed";

        }

        public async Task<List<TeamResponseDto>> GetTeamsAsync()

        {

            var teams = await _repo.GetAllAsync();

            return teams.Select(t => new TeamResponseDto

            {

                TeamId = t.TeamId,

                Name = t.Name,

                DepartmentId = t.DepartmentId,

                ManagerId = t.ManagerId,

                ManagerName = t.Manager != null

                    ? $"{t.Manager.FirstName} {t.Manager.LastName}"

                    : null

            }).ToList();

        }

        public async Task<TeamResponseDto?> GetTeamByIdAsync(int id)

        {

            var t = await _repo.GetByIdAsync(id);

            if (t == null) return null;

            return new TeamResponseDto

            {

                TeamId = t.TeamId,

                Name = t.Name,

                DepartmentId = t.DepartmentId,

                ManagerId = t.ManagerId,

                ManagerName = t.Manager != null

                    ? $"{t.Manager.FirstName} {t.Manager.LastName}"

                    : null

            };

        }

        public async Task<string> UpdateTeamAsync(int id, UpdateTeamDto dto)

        {

            var team = await _repo.GetByIdAsync(id);

            if (team == null)

                return "Team Not Found";

            team.Name = dto.Name;

            team.DepartmentId = dto.DepartmentId;

            team.ManagerId = dto.ManagerId;

            var result = await _repo.UpdateAsync(team);

            return result ? "Updated Successfully" : "Failed";

        }

        public async Task<string> DeleteTeamAsync(int id)

        {

            var team = await _repo.GetByIdAsync(id);

            if (team == null)

                return "Not Found";

            var result = await _repo.DeleteAsync(team);

            return result ? "Deleted Successfully" : "Failed";

        }

    }

}
