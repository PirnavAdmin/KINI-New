using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Attendance;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories.Interfaces;

namespace TalentSphereAPI.Repositories
{
    public class AttendanceRepository : IAttendanceRepository
    {
        private readonly ApplicationDbContext _context;

        public AttendanceRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        #region Attendance

        public async Task<Attendance?> GetByIdAsync(int attendanceId)
        {
            return await _context.Attendances
                .Include(a => a.Student)
                .Include(a => a.LiveClass)
                .Include(a => a.Sessions)
                .FirstOrDefaultAsync(a => a.AttendanceId == attendanceId);
        }

        public async Task<List<Attendance>> GetAllAsync()
        {
            return await _context.Attendances
                .Include(a => a.Student)
                .Include(a => a.LiveClass)
                .Include(a => a.Sessions)
                .OrderByDescending(a => a.AttendanceId)
                .ToListAsync();
        }

        public async Task<List<Attendance>> GetByLiveClassAsync(
    int liveClassId)
        {
            return await _context.Attendances
                .Include(a => a.Student)
                .Include(a => a.Sessions)
                .Include(a => a.LiveClass)
                    .ThenInclude(l => l.Batch)
                .Where(a =>
                    a.LiveClassId == liveClassId)
                .OrderBy(a => a.Student.FirstName)
                .ThenBy(a => a.Student.LastName)
                .ToListAsync();
        }
        public async Task<List<Attendance>> GetAttendanceByLiveClassAsync(int liveClassId)
        {
            return await _context.Attendances
                .Include(a => a.Student)
                .Include(a => a.LiveClass)
                .Include(a => a.Sessions)
                .Where(a => a.LiveClassId == liveClassId)
                .ToListAsync();
        }

        public async Task<List<Attendance>> GetByStudentAsync(int studentId)
        {
            return await _context.Attendances
                .Include(a => a.LiveClass)
                .Include(a => a.Sessions)
                .Where(a => a.StudentId == studentId)
                .OrderByDescending(a => a.LiveClass.ScheduledDate)
                .ThenByDescending(a => a.LiveClass.StartTime)
                .ToListAsync();
        }

        public async Task<Attendance?> GetStudentAttendanceAsync(int studentId, int liveClassId)
        {
            return await _context.Attendances
                .Include(a => a.Student)
                .Include(a => a.LiveClass)
                .Include(a => a.Sessions)
                .FirstOrDefaultAsync(a =>
                    a.StudentId == studentId &&
                    a.LiveClassId == liveClassId);
        }

        public async Task<bool> ExistsAsync(int studentId, int liveClassId)
        {
            return await _context.Attendances.AnyAsync(a =>
                a.StudentId == studentId &&
                a.LiveClassId == liveClassId);
        }

        public async Task AddAsync(Attendance attendance)
        {
            await _context.Attendances.AddAsync(attendance);
        }

        public async Task AddRangeAsync(IEnumerable<Attendance> attendances)
        {
            await _context.Attendances.AddRangeAsync(attendances);
        }

        public Task UpdateAsync(Attendance attendance)
        {
            _context.Attendances.Update(attendance);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(int attendanceId)
        {
            var attendance = await _context.Attendances
                .FirstOrDefaultAsync(a => a.AttendanceId == attendanceId);

            if (attendance != null)
            {
                _context.Attendances.Remove(attendance);
            }
        }

        #endregion

        #region Attendance Sessions

        public async Task AddSessionAsync(AttendanceSession session)
        {
            await _context.AttendanceSessions.AddAsync(session);
        }

        public Task UpdateSessionAsync(AttendanceSession session)
        {
            _context.AttendanceSessions.Update(session);
            return Task.CompletedTask;
        }

        public async Task<List<AttendanceSession>> GetSessionsAsync(int attendanceId)
        {
            return await _context.AttendanceSessions
                .Where(s => s.AttendanceId == attendanceId)
                .OrderBy(s => s.JoinedAt)
                .ToListAsync();
        }

        public async Task<AttendanceSession?> GetActiveSessionAsync(int attendanceId)
        {
            return await _context.AttendanceSessions
                .Where(s =>
                    s.AttendanceId == attendanceId &&
                    !s.IsCompleted &&
                    s.LeftAt == null)
                .OrderByDescending(s => s.JoinedAt)
                .FirstOrDefaultAsync();
        }
        #endregion

        #region Meeting Events

        public async Task AddMeetingEventAsync(MeetingEvent meetingEvent)
        {
            await _context.MeetingEvents.AddAsync(meetingEvent);
        }

        public async Task<List<MeetingEvent>> GetUnprocessedMeetingEventsAsync()
        {
            return await _context.MeetingEvents
                .Where(e => !e.IsProcessed)
                .OrderBy(e => e.EventTime)
                .ToListAsync();
        }

        public async Task MarkMeetingEventProcessedAsync(int meetingEventId)
        {
            var meetingEvent = await _context.MeetingEvents
                .FirstOrDefaultAsync(e => e.MeetingEventId == meetingEventId);

            if (meetingEvent == null)
                return;

            meetingEvent.IsProcessed = true;
            _context.MeetingEvents.Update(meetingEvent);
        }

        #endregion

        #region Dashboard

        public async Task<int> GetPresentCountAsync(int liveClassId)
        {
            return await _context.Attendances.CountAsync(a =>
                a.LiveClassId == liveClassId &&
                a.Status == AttendanceStatus.Present);
        }

        public async Task<int> GetLateCountAsync(int liveClassId)
        {
            return await _context.Attendances.CountAsync(a =>
                a.LiveClassId == liveClassId &&
                a.Status == AttendanceStatus.Late);
        }

        public async Task<int> GetAbsentCountAsync(int liveClassId)
        {
            return await _context.Attendances.CountAsync(a =>
                a.LiveClassId == liveClassId &&
                a.Status == AttendanceStatus.Absent);
        }

        public async Task<decimal> GetAverageAttendanceAsync(int liveClassId)
        {
            var average = await _context.Attendances
                .Where(a => a.LiveClassId == liveClassId)
                .AverageAsync(a => (decimal?)a.AttendancePercentage);

            return average ?? 0;
        }

        
public async Task<LiveAttendanceDashboardDto>
    GetLiveDashboardAsync(int liveClassId)
        {
            var attendances =
                await _context.Attendances
                    .Include(a => a.Student)
                    .Include(a => a.Sessions)
                    .Where(a =>
                        a.LiveClassId == liveClassId)
                    .ToListAsync();

            return new LiveAttendanceDashboardDto
            {
                LiveClassId =
                    liveClassId,

                PresentCount =
                    attendances.Count(a =>
                        a.Status == AttendanceStatus.Present),

                LateCount =
                    attendances.Count(a =>
                        a.Status == AttendanceStatus.Late),

                AbsentCount =
                    attendances.Count(a =>
                        a.Status == AttendanceStatus.Absent),

                AverageAttendance =
                    attendances.Any()
                        ? Math.Round(
                            attendances.Average(
                                a => a.AttendancePercentage),
                            2)
                        : 0,

                Students =
                    attendances
                        .Select(a =>
                        {
                            var isOnline =
                                a.Sessions.Any(s =>
                                    !s.IsCompleted &&
                                    s.LeftAt == null &&
                                    !string.IsNullOrWhiteSpace(
                                        s.MeetingParticipantId) &&
                                    !s.MeetingParticipantId
                                        .StartsWith(
                                            "app:",
                                            StringComparison.OrdinalIgnoreCase));

                            return new LiveAttendanceStudentDto
                            {
                                AttendanceId =
                                    a.AttendanceId,

                                StudentId =
                                    a.StudentId,

                                StudentName =
                                    $"{a.Student.FirstName} {a.Student.LastName}"
                                        .Trim(),

                                Status =
                                    a.Status.ToString(),

                                AttendancePercentage =
                                    a.AttendancePercentage,

                                TotalDurationMinutes =
                                    a.TotalDurationMinutes,

                                FirstJoinTime =
                                    a.FirstJoinTime,

                                LastLeaveTime =
                                    a.LastLeaveTime,

                                IsOnline =
                                    isOnline
                            };
                        })
                        .ToList()
            };
        }


        #endregion

        #region Save Changes

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }


        public async Task<AttendanceReportDto> GetAttendanceReportAsync(int liveClassId)
        {
            var liveClass = await _context.LiveClasses
                .Include(l => l.Course)
                .Include(l => l.Batch)
                .Include(l => l.Mentor)
                .FirstOrDefaultAsync(l => l.LiveClassId == liveClassId);

            if (liveClass == null)
                throw new Exception("Live class not found.");

            var attendances = await _context.Attendances
                .Include(a => a.Student)
                .Where(a => a.LiveClassId == liveClassId)
                .ToListAsync();

            return new AttendanceReportDto
            {
                LiveClassId = liveClass.LiveClassId,

                ClassTitle = liveClass.ClassTitle,

                CourseName = liveClass.Course.CourseName,

                BatchName = liveClass.Batch.BatchName,

                MentorName =
                    liveClass.Mentor.FirstName + " " +
                    liveClass.Mentor.LastName,

                ScheduledDate = liveClass.ScheduledDate,

                TotalStudents = attendances.Count,

                PresentStudents = attendances.Count(a =>
                    a.Status == AttendanceStatus.Present),

                LateStudents = attendances.Count(a =>
                    a.Status == AttendanceStatus.Late),

                AbsentStudents = attendances.Count(a =>
                    a.Status == AttendanceStatus.Absent),

                AverageAttendance = attendances.Any()
                    ? Math.Round(attendances.Average(a => a.AttendancePercentage), 2)
                    : 0,

                Students = attendances.Select(a =>
                    new AttendanceStudentReportDto
                    {
                        StudentId = a.StudentId,

                        StudentName =
                            a.Student.FirstName + " " +
                            a.Student.LastName,

                        Status = a.Status.ToString(),

                        AttendancePercentage =
                            a.AttendancePercentage,

                        DurationMinutes =
                            a.TotalDurationMinutes,

                        FirstJoinTime =
                            a.FirstJoinTime,

                        LastLeaveTime =
                            a.LastLeaveTime
                    }).ToList()
            };
        }
        #endregion
    }
}