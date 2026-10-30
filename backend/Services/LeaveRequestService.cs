using TalentSphereAPI.Enums;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories.Interfaces;
using TalentSphereAPI.Services.Tenancy;
using System.Security.Claims;

namespace TalentSphereAPI.Services
{
    public class LeaveRequestService : ILeaveRequestService
    {
        private readonly ILeaveRequestRepository _repository;
        private readonly EmployeeIdentityService _employeeIdentityService;
        private readonly ITenantContext _tenantContext;
        private readonly INotificationService _notificationService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public LeaveRequestService(
    ILeaveRequestRepository repository,
    EmployeeIdentityService employeeIdentityService,
    ITenantContext tenantContext,
    INotificationService notificationService,
    IHttpContextAccessor httpContextAccessor)
        {
            _repository = repository;
            _employeeIdentityService = employeeIdentityService;
            _tenantContext = tenantContext;
            _notificationService = notificationService;
            _httpContextAccessor = httpContextAccessor;
        }

        // =========================================================
        // CREATE LEAVE REQUEST
        // EMPLOYEE / MENTOR / HR
        // =========================================================

        public async Task<LeaveRequest> CreateAsync(
            string leaveType,
            DateOnly startDate,
            DateOnly endDate,
            string? reason)
        {
            if (string.IsNullOrWhiteSpace(leaveType))
            {
                throw new ArgumentException(
                    "Leave type is required.");
            }

            if (startDate > endDate)
            {
                throw new ArgumentException(
                    "Start date cannot be after end date.");
            }

            var employee =
                await _employeeIdentityService
                    .GetCurrentEmployeeAsync();

            var leaveRequest = new LeaveRequest
            {
                OrganizationId = employee.OrganizationId,

                EmployeeId = employee.EmployeeId,

                LeaveType = leaveType.Trim(),

                StartDate = startDate,

                EndDate = endDate,

                Reason = string.IsNullOrWhiteSpace(reason)
        ? null
        : reason.Trim(),

                AppliedOn = DateTime.UtcNow,

                Status = LeaveRequestStatus.Pending,

                ApprovedBy = null,

                ApprovedOn = null,

                RejectionReason = null
            };
            var created =
                await _repository.AddAsync(leaveRequest);

            var employeeName =
                $"{employee.FirstName} {employee.LastName}".Trim();

            var message =
                $"{employeeName} has submitted a " +
                $"{created.LeaveType} leave request from " +
                $"{created.StartDate:dd-MM-yyyy} to " +
                $"{created.EndDate:dd-MM-yyyy}.";

            try
            {
                await _notificationService
                    .CreateOrganizationNotificationAsync(
                        created.OrganizationId,
                        "New Leave Request",
                        message,
                        NotificationType.LeaveRequestCreated,
                        created.LeaveRequestId,
                        ReferenceType.LeaveRequest);
            }
            catch
            {
                // Leave request is already saved.
                // Notification failure must not undo the request.
            }

            return created;
        }

        // =========================================================
        // GET MY LEAVE REQUESTS
        // EMPLOYEE / MENTOR / HR
        // =========================================================

        public async Task<IEnumerable<LeaveRequest>>
            GetMyRequestsAsync()
        {
            var employee =
                await _employeeIdentityService
                    .GetCurrentEmployeeAsync();

            return await _repository.GetAllAsync(
                employee.OrganizationId,
                employee.EmployeeId);
        }

        // =========================================================
        // GET ALL LEAVE REQUESTS
        // ORGANIZATION ADMIN
        // =========================================================

        public async Task<IEnumerable<LeaveRequest>>
            GetAllAsync()
        {
            var organizationId =
                _tenantContext.OrganizationId;

            return await _repository.GetAllAsync(
                organizationId);
        }

        // =========================================================
        // APPROVE LEAVE REQUEST
        // ORGANIZATION ADMIN
        // =========================================================

        public async Task<LeaveRequest> ApproveAsync(
            int leaveRequestId)
        {
            if (leaveRequestId <= 0)
            {
                throw new ArgumentException(
                    "Invalid leave request ID.");
            }

            var organizationId =
                _tenantContext.OrganizationId;

            var leaveRequest =
                await _repository.GetByIdAsync(
                    leaveRequestId,
                    organizationId);

            if (leaveRequest == null)
            {
                throw new KeyNotFoundException(
                    "Leave request not found.");
            }

            if (leaveRequest.Status !=
                LeaveRequestStatus.Pending)
            {
                throw new InvalidOperationException(
                    "Only pending leave requests can be approved.");
            }

            leaveRequest.Status =
                LeaveRequestStatus.Approved;

            leaveRequest.ApprovedOn =
                DateTime.UtcNow;

            leaveRequest.ApprovedBy =
                GetCurrentUserId();

            var updated =
                await _repository.UpdateAsync(
                    leaveRequest);

            var employeeName =
                $"{updated.Employee.FirstName} " +
                $"{updated.Employee.LastName}".Trim();

            var message =
                $"{employeeName}'s " +
                $"{updated.LeaveType} leave request from " +
                $"{updated.StartDate:dd-MM-yyyy} to " +
                $"{updated.EndDate:dd-MM-yyyy} has been approved.";

            try
            {
                await _notificationService
                    .CreateOrganizationNotificationAsync(
                        updated.OrganizationId,
                        "Leave Request Approved",
                        message,
                        NotificationType.LeaveApproved,
                        updated.LeaveRequestId,
                        ReferenceType.LeaveRequest);
            }
            catch
            {
                // Leave approval is already saved.
            }

            return updated;
        }

        // =========================================================
        // REJECT LEAVE REQUEST
        // ORGANIZATION ADMIN
        // =========================================================

        public async Task<LeaveRequest> RejectAsync(
            int leaveRequestId)
        {
            if (leaveRequestId <= 0)
            {
                throw new ArgumentException(
                    "Invalid leave request ID.");
            }

            var organizationId =
                _tenantContext.OrganizationId;

            var leaveRequest =
                await _repository.GetByIdAsync(
                    leaveRequestId,
                    organizationId);

            if (leaveRequest == null)
            {
                throw new KeyNotFoundException(
                    "Leave request not found.");
            }

            if (leaveRequest.Status !=
                LeaveRequestStatus.Pending)
            {
                throw new InvalidOperationException(
                    "Only pending leave requests can be rejected.");
            }

            leaveRequest.Status =
                LeaveRequestStatus.Rejected;

            leaveRequest.ApprovedOn =
                DateTime.UtcNow;

            leaveRequest.ApprovedBy =
                GetCurrentUserId();

            var updated =
                await _repository.UpdateAsync(
                    leaveRequest);

            var employeeName =
                $"{updated.Employee.FirstName} " +
                $"{updated.Employee.LastName}".Trim();

            var message =
                $"{employeeName}'s " +
                $"{updated.LeaveType} leave request from " +
                $"{updated.StartDate:dd-MM-yyyy} to " +
                $"{updated.EndDate:dd-MM-yyyy} has been rejected.";

            try
            {
                await _notificationService
                    .CreateOrganizationNotificationAsync(
                        updated.OrganizationId,
                        "Leave Request Rejected",
                        message,
                        NotificationType.LeaveRejected,
                        updated.LeaveRequestId,
                        ReferenceType.LeaveRequest);
            }
            catch
            {
                // Leave rejection is already saved.
            }

            return updated;
        }

        // =========================================================
        // CURRENT USER ID
        // =========================================================

        private int GetCurrentUserId()
        {
            var userIdClaim =
                _httpContextAccessor.HttpContext?.User
                    .FindFirst(ClaimTypes.NameIdentifier)
                    ?.Value;

            if (!int.TryParse(
                    userIdClaim,
                    out var userId))
            {
                throw new UnauthorizedAccessException(
                    "UserId was not found in the authenticated token.");
            }

            return userId;
        }
    }
}