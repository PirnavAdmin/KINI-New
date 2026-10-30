namespace TalentSphereAPI.Services.Interfaces
{
    public interface IAttendancePdfService
    {
        Task<byte[]> GenerateAttendanceReportPdfAsync(int liveClassId);
    }
}