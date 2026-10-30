using Microsoft.EntityFrameworkCore;

using TalentSphereAPI.Data;

using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories

{

    public class TeamRepository : ITeamRepository

    {

        private readonly ApplicationDbContext _context;

        public TeamRepository(ApplicationDbContext context)

        {

            _context = context;

        }

        public async Task<bool> AddAsync(Team team)

        {

            await _context.Teams.AddAsync(team);

            return await _context.SaveChangesAsync() > 0;

        }

        public async Task<List<Team>> GetAllAsync()

        {

            return await _context.Teams

                .Include(t => t.Manager)

                .ToListAsync();

        }

        public async Task<Team?> GetByIdAsync(int id)

        {

            return await _context.Teams

                .Include(t => t.Manager)

                .FirstOrDefaultAsync(t => t.TeamId == id);

        }

        public async Task<bool> UpdateAsync(Team team)

        {

            _context.Teams.Update(team);

            return await _context.SaveChangesAsync() > 0;

        }

        public async Task<bool> DeleteAsync(Team team)

        {

            _context.Teams.Remove(team);

            return await _context.SaveChangesAsync() > 0;

        }

        public async Task<bool> DepartmentExistsAsync(int departmentId)

        {

            return await _context.Departments

                .AnyAsync(d => d.DepartmentId == departmentId);

        }

        public async Task<bool> ManagerExistsAsync(int managerId)

        {

            return await _context.Employees

                .AnyAsync(e => e.EmployeeId == managerId);

        }

    }

}
