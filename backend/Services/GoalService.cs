using TalentSphereAPI.DTOs.Goals;

using TalentSphereAPI.Models;

using TalentSphereAPI.Repositories;

namespace TalentSphereAPI.Services

{

    public class GoalService : IGoalService

    {

        private readonly IGoalRepository _repository;

        public GoalService(

            IGoalRepository repository)

        {

            _repository = repository;

        }

        public async Task<List<GoalResponseDto>>

            GetAllGoalsAsync()

        {

            var goals =

                await _repository.GetAllGoalsAsync();

            return goals.Select(g =>

                new GoalResponseDto

                {

                    GoalId = g.GoalId,

                    Title = g.Title,

                    OwnerId = g.OwnerId,

                    Quarter = g.Quarter,

                    Status = g.Status

                }).ToList();

        }

        public async Task<GoalResponseDto?>

            GetGoalByIdAsync(int goalId)

        {

            var goal =

                await _repository.GetGoalByIdAsync(

                    goalId);

            if (goal == null)

            {

                return null;

            }

            return new GoalResponseDto

            {

                GoalId = goal.GoalId,

                Title = goal.Title,

                OwnerId = goal.OwnerId,

                Quarter = goal.Quarter,

                Status = goal.Status

            };

        }

        public async Task<string>

            CreateGoalAsync(CreateGoalDto dto)

        {

            var employeeExists =

                await _repository

                    .EmployeeExistsAsync(

                        dto.OwnerId);

            if (!employeeExists)

            {

                throw new Exception(

                    "Owner not found.");

            }

            var goal = new Goal

            {

                Title = dto.Title,

                OwnerId = dto.OwnerId,

                Quarter = dto.Quarter,

                Status = dto.Status

            };

            await _repository.CreateGoalAsync(goal);

            return "Goal created successfully.";

        }

        public async Task<string>

            UpdateGoalAsync(

                int goalId,

                UpdateGoalDto dto)

        {

            var employeeExists =

                await _repository

                    .EmployeeExistsAsync(

                        dto.OwnerId);

            if (!employeeExists)

            {

                throw new Exception(

                    "Owner not found.");

            }

            var goal = new Goal

            {

                GoalId = goalId,

                Title = dto.Title,

                OwnerId = dto.OwnerId,

                Quarter = dto.Quarter,

                Status = dto.Status

            };

            var updatedGoal =

                await _repository

                    .UpdateGoalAsync(goal);

            if (updatedGoal == null)

            {

                throw new Exception(

                    "Goal not found.");

            }

            return "Goal updated successfully.";

        }

        public async Task<string>

            DeleteGoalAsync(int goalId)

        {

            var deleted =

                await _repository

                    .DeleteGoalAsync(goalId);

            if (!deleted)

            {

                throw new Exception(

                    "Goal not found.");

            }

            return "Goal deleted successfully.";

        }

    }

}
