using TalentSphereAPI.DTOs.Attendance;
using TalentSphereAPI.DTOs.Batch;
using TalentSphereAPI.DTOs.Dashboard;
using TalentSphereAPI.DTOs.Mentor;
using TalentSphereAPI.DTOs.CourseSyllabus;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories.Interfaces;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services
{
    public class MentorDashboardService : IMentorDashboardService
    {
        private readonly IMentorDashboardRepository _repository;

        public MentorDashboardService(
            IMentorDashboardRepository repository)
        {
            _repository = repository;
        }

        public async Task<MentorDashboardDto> GetDashboardAsync(
            int mentorId)
        {
            return await _repository
                .GetDashboardAsync(mentorId);
        }

        public async Task<List<TodayClassDto>> GetTodayClassesAsync(
            int mentorId)
        {
            return await _repository
                .GetTodayClassesAsync(mentorId);
        }

        public async Task<List<TodayClassDto>> GetUpcomingClassesAsync(
            int mentorId)
        {
            return await _repository
                .GetUpcomingClassesAsync(mentorId);
        }

        public async Task<AttendanceSummaryDto> GetAttendanceSummaryAsync(
            int mentorId)
        {
            return await _repository
                .GetAttendanceSummaryAsync(mentorId);
        }

        public async Task<List<MentorCourseDto>> GetMentorCoursesAsync(
            int userId)
        {
            return await _repository
                .GetMentorCoursesAsync(userId);
        }

        public async Task<CourseSyllabusDto?>
    GetMentorCourseSyllabusAsync(
        int userId,
        int courseId)
        {
            return await _repository
                .GetMentorCourseSyllabusAsync(
                    userId,
                    courseId);
        }

        public async Task<List<MentorStudentDto>>
    GetMentorStudentsAsync(int userId)
        {
            return await _repository
                .GetMentorStudentsAsync(userId);
        }

        public async Task<List<MentorClassDto>>
            GetMentorClassesAsync(int userId)
        {
            return await _repository
                .GetMentorClassesAsync(userId);
        }
        public async Task<MentorBatchesResponseDto>
    GetMentorBatchesAsync(
        int userId,
        int page,
        int pageSize,
        BatchStatus? status,
        string? search)
        {
            if (userId <= 0)
            {
                throw new UnauthorizedAccessException(
                    "Invalid user identity.");
            }

            if (page < 1)
                page = 1;

            if (pageSize < 1)
                pageSize = 10;

            if (pageSize > 100)
                pageSize = 100;

            return await _repository
                .GetMentorBatchesAsync(
                    userId,
                    page,
                    pageSize,
                    status,
                    search);
        }
    }
}