namespace TalentSphereAPI.Services.Interfaces
{
    public interface ISignalRService
    {
        Task NotifyBatchAsync(
            int batchId,
            object notification);

        Task NotifyMentorAsync(
            int mentorId,
            object notification);

        Task NotifyOrganizationAsync(
            int organizationId,
            object notification);

        Task NotifyStudentAsync(
    int studentId,
    object notification);

        Task NotifyEmployeeAsync(
    int employeeId,
    object notification);
    }
}