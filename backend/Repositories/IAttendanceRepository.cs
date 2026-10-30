using TalentSphereAPI.Models;
using TalentSphereAPI.DTOs.Attendance;

namespace TalentSphereAPI.Repositories.Interfaces
{
    public interface IAttendanceRepository
    {
        // =====================================================
        // Attendance
        // =====================================================

        Task<Attendance?> GetByIdAsync(int attendanceId);

        Task<List<Attendance>> GetAllAsync();

        Task<List<Attendance>> GetByLiveClassAsync(int liveClassId);

        Task<List<Attendance>> GetByStudentAsync(int studentId);

        Task<LiveAttendanceDashboardDto> GetLiveDashboardAsync(int liveClassId);

        Task<AttendanceReportDto> GetAttendanceReportAsync(int liveClassId);


        Task<Attendance?> GetStudentAttendanceAsync(
            int studentId,
            int liveClassId);

        Task<List<Attendance>> GetAttendanceByLiveClassAsync(
            int liveClassId);

        Task<bool> ExistsAsync(
            int studentId,
            int liveClassId);

        Task AddAsync(Attendance attendance);

        Task AddRangeAsync(IEnumerable<Attendance> attendances);

        Task UpdateAsync(Attendance attendance);

        Task DeleteAsync(int attendanceId);

        // =====================================================
        // Attendance Sessions
        // =====================================================

        Task AddSessionAsync(AttendanceSession session);

        Task UpdateSessionAsync(AttendanceSession session);

        Task<List<AttendanceSession>> GetSessionsAsync(
            int attendanceId);

        Task<AttendanceSession?> GetActiveSessionAsync(
            int attendanceId);

        // =====================================================
        // Meeting Events
        // =====================================================

        Task AddMeetingEventAsync(MeetingEvent meetingEvent);

        Task<List<MeetingEvent>> GetUnprocessedMeetingEventsAsync();

        Task MarkMeetingEventProcessedAsync(int meetingEventId);

        // =====================================================
        // Dashboard / Reports
        // =====================================================

        Task<int> GetPresentCountAsync(int liveClassId);

        Task<int> GetLateCountAsync(int liveClassId);

        Task<int> GetAbsentCountAsync(int liveClassId);

        Task<decimal> GetAverageAttendanceAsync(int liveClassId);

        // =====================================================
        // Save Changes
        // =====================================================

        Task<int> SaveChangesAsync();
    }
}