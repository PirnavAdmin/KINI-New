using TalentSphereAPI.DTOs.Attendance;
using TalentSphereAPI.DTOs.Batch;
using TalentSphereAPI.DTOs.CourseSyllabus;
using TalentSphereAPI.DTOs.Dashboard;
using TalentSphereAPI.DTOs.Mentor;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services.Interfaces
{
    public interface IMentorDashboardService
    {
        Task<MentorDashboardDto> GetDashboardAsync(
            int mentorId);

        Task<List<TodayClassDto>> GetTodayClassesAsync(
            int mentorId);

        Task<List<TodayClassDto>> GetUpcomingClassesAsync(
            int mentorId);

        Task<AttendanceSummaryDto> GetAttendanceSummaryAsync(
            int mentorId);

        Task<List<MentorCourseDto>> GetMentorCoursesAsync(
            int userId);

        Task<List<MentorStudentDto>> GetMentorStudentsAsync(
            int userId);

        Task<List<MentorClassDto>> GetMentorClassesAsync(
            int userId);

        Task<MentorBatchesResponseDto> GetMentorBatchesAsync(
            int userId,
            int page,
            int pageSize,
            BatchStatus? status,
            string? search);

        Task<CourseSyllabusDto?> GetMentorCourseSyllabusAsync(
    int userId,
    int courseId);
    }
}