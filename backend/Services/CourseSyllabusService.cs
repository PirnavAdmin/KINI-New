using TalentSphereAPI.DTOs.CourseSyllabus;
using TalentSphereAPI.Repositories;

namespace TalentSphereAPI.Services
{
    public class CourseSyllabusService
        : ICourseSyllabusService
    {
        private readonly ICourseSyllabusRepository _repository;

        public CourseSyllabusService(
            ICourseSyllabusRepository repository)
        {
            _repository = repository;
        }

        public async Task<CourseSyllabusDto?> GetByCourseIdAsync(
    int courseId,
    int? batchId = null)
        {
            return await _repository.GetByCourseIdAsync(
                courseId,
                batchId);
        }

        public async Task<CourseSyllabusDto>
            CreateOrReplaceAsync(
                int courseId,
                CreateCourseSyllabusDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            if (dto.Modules == null ||
                dto.Modules.Count == 0)
            {
                throw new ArgumentException(
                    "At least one module is required.");
            }

            foreach (var module in dto.Modules)
            {
                if (string.IsNullOrWhiteSpace(
                    module.ModuleName))
                {
                    throw new ArgumentException(
                        "Module name is required.");
                }

                foreach (var topic in module.Topics)
                {
                    if (string.IsNullOrWhiteSpace(
                        topic.TopicName))
                    {
                        throw new ArgumentException(
                            "Topic name is required.");
                    }

                    foreach (var lesson in topic.Lessons)
                    {
                        if (string.IsNullOrWhiteSpace(
                            lesson.LessonName))
                        {
                            throw new ArgumentException(
                                "Lesson name is required.");
                        }
                    }
                }
            }

            return await _repository
                .CreateOrReplaceAsync(
                    courseId,
                    dto);
        }
    }
}