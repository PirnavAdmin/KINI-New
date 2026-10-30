using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.CourseSyllabus;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services.Tenancy;
using static TalentSphereAPI.DTOs.CourseSyllabus.CourseLessonDto;

namespace TalentSphereAPI.Repositories
{
    public class CourseSyllabusRepository
        : ICourseSyllabusRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ITenantContext _tenantContext;

        public CourseSyllabusRepository(
            ApplicationDbContext context,
            ITenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        private int OrganizationId =>
            _tenantContext.OrganizationId;

        // =====================================================
        // GET SYLLABUS
        // =====================================================

        public async Task<CourseSyllabusDto?> GetByCourseIdAsync(
    int courseId,
    int? batchId = null)
        {
            var course = await _context.Courses
                .AsNoTracking()
                .Where(c =>
                    c.CourseId == courseId &&
                    c.OrganizationId == OrganizationId)
                .Include(c => c.Modules)
                    .ThenInclude(m => m.Topics)
                        .ThenInclude(t => t.Lessons)
                .AsSplitQuery()
                .FirstOrDefaultAsync();

            if (course == null)
                return null;

            var result = MapToDto(course);

            if (!batchId.HasValue)
                return result;

            var batch = await _context.Batches
                .AsNoTracking()
                .FirstOrDefaultAsync(b =>
                    b.BatchId == batchId.Value &&
                    b.CourseId == courseId &&
                    b.OrganizationId == OrganizationId);

            if (batch == null)
                throw new ArgumentException(
                    "The selected batch does not belong to this course.");

            var progress = await _context.BatchModuleCompletions
                .AsNoTracking()
                .Where(x =>
                    x.BatchId == batchId.Value &&
                    x.CourseId == courseId)
                .Select(x => new
                {
                    x.ModuleId,
                    x.IsCompleted
                })
                .ToListAsync();

            var progressByModule = progress.ToDictionary(
                x => x.ModuleId,
                x => x.IsCompleted);

            foreach (var module in result.Modules)
            {
                module.BatchProgress = new List<BatchModuleProgressDto>
        {
            new BatchModuleProgressDto
            {
                BatchId = batchId.Value,
                IsCompleted = progressByModule.TryGetValue(
                    module.ModuleId,
                    out var completed)
                        ? completed
                        : null
            }
        };
            }

            return result;
        }
        // =====================================================
        // CREATE / REPLACE SYLLABUS
        // =====================================================

        public async Task<CourseSyllabusDto>
            CreateOrReplaceAsync(
                int courseId,
                CreateCourseSyllabusDto dto)
        {
            var course =
                await _context.Courses
                    .Where(c =>
                        c.CourseId == courseId &&
                        c.OrganizationId == OrganizationId)
                    .Include(c => c.Modules)
                        .ThenInclude(m => m.Topics)
                            .ThenInclude(t => t.Lessons)
                    .FirstOrDefaultAsync();

            if (course == null)
            {
                throw new KeyNotFoundException(
                    "Course not found.");
            }

            // =================================================
            // REMOVE EXISTING SYLLABUS
            // =================================================

            course.Modules.Clear();

            // =================================================
            // CREATE MODULES
            // =================================================

            foreach (var moduleDto in dto.Modules)
            {
                var module = new CourseModule
                {
                    CourseId = course.CourseId,

                    ModuleNumber =
                        moduleDto.ModuleNumber,

                    ModuleName =
                        moduleDto.ModuleName.Trim(),

                    Description =
                        moduleDto.Description?.Trim()
                };

                // =============================================
                // CREATE TOPICS
                // =============================================

                foreach (var topicDto in moduleDto.Topics)
                {
                    var topic = new CourseTopic
                    {
                        TopicNumber =
                            topicDto.TopicNumber,

                        TopicName =
                            topicDto.TopicName.Trim()
                    };

                    // =========================================
                    // CREATE LESSONS
                    // =========================================

                    foreach (var lessonDto in topicDto.Lessons)
                    {
                        topic.Lessons.Add(
                            new CourseLesson
                            {
                                LessonNumber =
                                    lessonDto.LessonNumber,

                                LessonName =
                                    lessonDto.LessonName.Trim(),

                                Description =
                                    lessonDto.Description?.Trim()
                            });
                    }

                    module.Topics.Add(topic);
                }

                course.Modules.Add(module);
            }

            await _context.SaveChangesAsync();

            return MapToDto(course);
        }

        // =====================================================
        // MAP COURSE -> SYLLABUS DTO
        // =====================================================

        private static CourseSyllabusDto MapToDto(
            Course course)
        {
            return new CourseSyllabusDto
            {
                CourseId =
                    course.CourseId,

                CourseName =
                    course.CourseName,

                CourseCode =
                    course.CourseCode,

                Description =
                    course.Description ?? string.Empty,

                Modules =
                    course.Modules
                        .OrderBy(m => m.ModuleNumber)
                        .Select(m =>
                            new CourseModuleDto
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
                                            new CourseTopicDto
                                            {
                                                TopicId =
                                                    t.TopicId,

                                                TopicNumber =
                                                    t.TopicNumber,

                                                TopicName =
                                                    t.TopicName,

                                                Description =
                                                    t.Description
                                                    ?? string.Empty,

                                                Lessons =
                                                    t.Lessons
                                                        .OrderBy(l =>
                                                            l.LessonNumber)
                                                        .Select(l =>
                                                            new CourseLessonDto
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
        }
    }
}