using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories

{

    public interface IGoalRepository

    {

        Task<List<Goal>> GetAllGoalsAsync();

        Task<Goal?> GetGoalByIdAsync(int goalId);

        Task<Goal> CreateGoalAsync(Goal goal);

        Task<Goal?> UpdateGoalAsync(Goal goal);

        Task<bool> DeleteGoalAsync(int goalId);

        Task<bool> EmployeeExistsAsync(int employeeId);

    }

}
