using TalentSphereAPI.DTOs.Attendance;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services;

public interface IAttendanceService
{
    Task CreateAttendanceForLiveClassAsync(int liveClassId);

    Task<List<Attendance>> GetAttendanceByLiveClassAsync(
        int liveClassId);

    Task<List<Attendance>> GetAttendanceByStudentAsync(
        int studentId);

    

    Task<Attendance?> GetStudentAttendanceAsync(
        int studentId,
        int liveClassId);

    Task UpdateAttendanceAsync(
        Attendance attendance);

    Task AddAttendanceSessionAsync(
        AttendanceSession session);

    Task<List<AttendanceSession>> GetSessionsAsync(
        int attendanceId);

    Task SaveMeetingEventAsync(
        MeetingEvent meetingEvent);

    Task ProcessMeetingEventsAsync();

    Task<LiveAttendanceDashboardDto> GetLiveDashboardAsync(
        int liveClassId);

    Task<AttendanceReportDto> GetAttendanceReportAsync(
        int liveClassId);

    Task MarkStudentJoinedAsync(
        int liveClassId);

    Task<Attendance?> GetMyAttendanceAsync(
    int liveClassId);


   

    Task<AttendancePercentageDto> GetStudentAttendancePercentageAsync(
        int studentId);

    Task<StudentAttendanceSummaryDto> GetStudentAttendanceSummaryAsync(
        int studentId);

}