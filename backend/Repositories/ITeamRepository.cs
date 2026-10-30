using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories

{

    public interface ITeamRepository

    {

        Task<bool> AddAsync(Team team);

        Task<List<Team>> GetAllAsync();

        Task<Team?> GetByIdAsync(int id);

        Task<bool> UpdateAsync(Team team);

        Task<bool> DeleteAsync(Team team);

        Task<bool> DepartmentExistsAsync(int departmentId);

        Task<bool> ManagerExistsAsync(int managerId);

    }

}
