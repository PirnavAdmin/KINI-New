using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services
{
    public interface ILeaveRequestService
    {
        Task<LeaveRequest> CreateAsync(
            string leaveType,
            DateOnly startDate,
            DateOnly endDate,
            string? reason);

        Task<IEnumerable<LeaveRequest>> GetMyRequestsAsync();

        Task<IEnumerable<LeaveRequest>> GetAllAsync();

        Task<LeaveRequest> ApproveAsync(int leaveRequestId);

        Task<LeaveRequest> RejectAsync(int leaveRequestId);
    }
}