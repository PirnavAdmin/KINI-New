using Microsoft.EntityFrameworkCore;

using TalentSphereAPI.Data;

using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories

{

    public class GoalRepository : IGoalRepository

    {

        private readonly ApplicationDbContext _context;

        public GoalRepository(ApplicationDbContext context)

        {

            _context = context;

        }

        public async Task<List<Goal>> GetAllGoalsAsync()

        {

            return await _context.Goals

                .Include(g => g.Owner)

                .ToListAsync();

        }

        public async Task<Goal?> GetGoalByIdAsync(int goalId)

        {

            return await _context.Goals

                .Include(g => g.Owner)

                .FirstOrDefaultAsync(g => g.GoalId == goalId);

        }

        public async Task<Goal> CreateGoalAsync(Goal goal)

        {

            _context.Goals.Add(goal);

            await _context.SaveChangesAsync();

            return goal;

        }

        public async Task<Goal?> UpdateGoalAsync(Goal goal)

        {

            var existingGoal = await _context.Goals

                .FirstOrDefaultAsync(g => g.GoalId == goal.GoalId);

            if (existingGoal == null)

            {

                return null;

            }

            existingGoal.Title = goal.Title;

            existingGoal.OwnerId = goal.OwnerId;

            existingGoal.Quarter = goal.Quarter;

            existingGoal.Status = goal.Status;

            await _context.SaveChangesAsync();

            return existingGoal;

        }

        public async Task<bool> DeleteGoalAsync(int goalId)

        {

            var goal = await _context.Goals

                .FirstOrDefaultAsync(g => g.GoalId == goalId);

            if (goal == null)

            {

                return false;

            }

            _context.Goals.Remove(goal);

            await _context.SaveChangesAsync();

            return true;

        }

        public async Task<bool> EmployeeExistsAsync(int employeeId)

        {

            return await _context.Employees

                .AnyAsync(e => e.EmployeeId == employeeId);

        }

    }

}
