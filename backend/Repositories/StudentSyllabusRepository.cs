using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.StudentSyllabus;

namespace TalentSphereAPI.Repositories
{
    public class StudentSyllabusRepository
        : IStudentSyllabusRepository
    {
        private readonly ApplicationDbContext _context;

        public StudentSyllabusRepository(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<StudentSyllabusDto?>
            GetMySyllabusAsync(string identifier)
        {
            // =====================================================
            // VALIDATE IDENTIFIER
            // =====================================================

            if (string.IsNullOrWhiteSpace(identifier))
                return null;

            identifier = identifier.Trim();

            // =====================================================
            // FIND STUDENT
            // =====================================================

            var student =
                await _context.Students
                    .AsNoTracking()
                    .Where(s =>
                        !s.IsDeleted &&
                        (
                            s.Email == identifier ||
                            s.Phone == identifier
                        ))
                    .Select(s => new
                    {
                        s.StudentId,
                        s.CourseId,
                        s.OrganizationId,
                        s.Status
                    })
                    .FirstOrDefaultAsync();

            if (student == null)
                return null;

            // =====================================================
            // STUDENT MUST HAVE A COURSE
            // =====================================================

            if (student.CourseId <= 0)
            {
                return new StudentSyllabusDto
                {
                    StudentId = student.StudentId,
                    Course = null
                };
            }

            // =====================================================
            // GET COURSE + SYLLABUS
            // =====================================================

            var course =
                await _context.Courses
                    .AsNoTracking()
                    .Where(c =>
                        c.CourseId == student.CourseId &&
                        c.OrganizationId == student.OrganizationId)
                    .Include(c => c.Modules)
                        .ThenInclude(m => m.Topics)
                            .ThenInclude(t => t.Lessons)
                    .AsSplitQuery()
                    .FirstOrDefaultAsync();

            if (course == null)
            {
                return new StudentSyllabusDto
                {
                    StudentId = student.StudentId,
                    Course = null
                };
            }

            // =====================================================
            // BUILD COURSE RESPONSE
            // =====================================================

            var courseDto = new SyllabusCourseDto
            {
                CourseId = course.CourseId,

                CourseName = course.CourseName,

                CourseCode = course.CourseCode,

                Description =
                    course.Description ?? string.Empty,

                Duration = course.Duration,

                Status =
                    course.Status
                        ? "Active"
                        : "Inactive",

                Modules =
                    course.Modules
                        .OrderBy(m => m.ModuleNumber)
                        .Select(m =>
                            new SyllabusModuleDto
                            {
                                ModuleId =
                                    m.ModuleId,

                                ModuleNumber =
                                    m.ModuleNumber,

                                ModuleName =
                                    m.ModuleName,

                                Description =
                                    m.Description
                                    ?? string.Empty,

                                Topics =
                                    m.Topics
                                        .OrderBy(t =>
                                            t.TopicNumber)
                                        .Select(t =>
                                            new SyllabusTopicDto
                                            {
                                                TopicId =
                                                    t.TopicId,

                                                TopicNumber =
                                                    t.TopicNumber,

                                                TopicName =
                                                    t.TopicName,

                                                Lessons =
                                                    t.Lessons
                                                        .OrderBy(l =>
                                                            l.LessonNumber)
                                                        .Select(l =>
                                                            new SyllabusLessonDto
                                                            {
                                                                LessonId =
                                                                    l.LessonId,

                                                                LessonNumber =
                                                                    l.LessonNumber,

                                                                LessonName =
                                                                    l.LessonName,

                                                                Description =
                                                                    l.Description
                                                                    ?? string.Empty
                                                            })
                                                        .ToList()
                                            })
                                        .ToList()
                            })
                        .ToList()
            };

            // =====================================================
            // FINAL RESPONSE
            // =====================================================

            return new StudentSyllabusDto
            {
                StudentId =
                    student.StudentId,

                Course =
                    courseDto
            };
        }
    }
}