namespace TalentSphereAPI.Services.Interfaces
{
    public interface IExcelExportService
    {
        Task<byte[]> GenerateAttendanceExcelAsync(int liveClassId);
    }
}