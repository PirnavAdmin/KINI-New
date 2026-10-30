using TalentSphereAPI.DTOs.HR;

namespace TalentSphereAPI.Services
{
    public interface IHrLeaveService
    {
        Task<HrLeaveSummaryDto>
            GetSummaryAsync();

        Task<HrLeavePagedResponse>
            GetLeavesAsync(
                HrLeaveQueryDto query);

        Task<HrLeaveResponseDto?>
            GetByIdAsync(
                int leaveId);

        Task<HrLeaveResponseDto>
            CreateAsync(
                HrCreateLeaveDto dto);

        Task<HrLeaveResponseDto>
            ApproveAsync(
                int leaveId);

        Task<HrLeaveResponseDto>
            RejectAsync(
                int leaveId,
                string rejectionReason);

        Task<HrEmployeeLeaveHistoryResponse>
            GetEmployeeHistoryAsync(
                int employeeId);

        Task<HrLeaveBalanceResponse>
            GetBalanceAsync(
                int employeeId);

        Task<HrLeaveTypesResponse>
            GetTypesAsync();
    }
}