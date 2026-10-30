using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories.Interfaces
{
    public interface ILeaveRequestRepository
    {
        Task<LeaveRequest?> GetApprovedLeaveForDateAsync(
            int employeeId,
            DateOnly date,
            int organizationId);

        Task<LeaveRequest?> GetByIdAsync(
            int id,
            int organizationId);

        Task<LeaveRequest> AddAsync(
            LeaveRequest leaveRequest);

        Task<LeaveRequest> UpdateAsync(
            LeaveRequest leaveRequest);

        Task<IEnumerable<LeaveRequest>> GetAllAsync(
            int organizationId,
            int? employeeId = null);
    }
}