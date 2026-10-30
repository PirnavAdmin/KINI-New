using TalentSphereAPI.DTOs.Goals;

namespace TalentSphereAPI.Services

{

    public interface IGoalService

    {

        Task<List<GoalResponseDto>> GetAllGoalsAsync();

        Task<GoalResponseDto?> GetGoalByIdAsync(int goalId);

        Task<string> CreateGoalAsync(CreateGoalDto dto);

        Task<string> UpdateGoalAsync(

            int goalId,

            UpdateGoalDto dto);

        Task<string> DeleteGoalAsync(int goalId);

    }

}
