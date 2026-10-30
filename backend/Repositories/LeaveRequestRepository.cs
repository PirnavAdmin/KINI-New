using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories.Interfaces;

namespace TalentSphereAPI.Repositories
{
    public class LeaveRequestRepository
        : ILeaveRequestRepository
    {
        private readonly ApplicationDbContext _context;

        public LeaveRequestRepository(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<LeaveRequest?> GetApprovedLeaveForDateAsync(
            int employeeId,
            DateOnly date,
            int organizationId)
        {
            return await _context.LeaveRequests
                .FirstOrDefaultAsync(x =>
                    x.EmployeeId == employeeId &&
                    x.OrganizationId == organizationId &&
                    x.Status == LeaveRequestStatus.Approved &&
                    x.StartDate <= date &&
                    x.EndDate >= date);
        }

        public async Task<LeaveRequest?> GetByIdAsync(
            int id,
            int organizationId)
        {
            return await _context.LeaveRequests
                .Include(x => x.Employee)
                .FirstOrDefaultAsync(x =>
                    x.LeaveRequestId == id &&
                    x.OrganizationId == organizationId);
        }

        public async Task<LeaveRequest> AddAsync(
            LeaveRequest leaveRequest)
        {
            await _context.LeaveRequests.AddAsync(leaveRequest);

            await _context.SaveChangesAsync();

            return leaveRequest;
        }

        public async Task<LeaveRequest> UpdateAsync(
            LeaveRequest leaveRequest)
        {
            _context.LeaveRequests.Update(leaveRequest);

            await _context.SaveChangesAsync();

            return leaveRequest;
        }

        public async Task<IEnumerable<LeaveRequest>> GetAllAsync(
            int organizationId,
            int? employeeId = null)
        {
            var query = _context.LeaveRequests
                .Include(x => x.Employee)
                .Where(x =>
                    x.OrganizationId == organizationId)
                .AsQueryable();

            if (employeeId.HasValue)
            {
                query = query.Where(x =>
                    x.EmployeeId == employeeId.Value);
            }

            return await query
                .OrderByDescending(x => x.StartDate)
                .ToListAsync();
        }
    }
}