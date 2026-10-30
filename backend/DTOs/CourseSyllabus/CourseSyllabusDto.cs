using static TalentSphereAPI.DTOs.CourseSyllabus.CourseLessonDto;
using System.Collections.Generic;

namespace TalentSphereAPI.DTOs.CourseSyllabus
{
    public class CourseSyllabusDto
    {
        public int CourseId { get; set; }

        public string CourseName { get; set; } = string.Empty;

        public string CourseCode { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public List<CourseModuleDto> Modules { get; set; }
            = new();
    }

    public class CourseModuleDto
    {
        public int ModuleId { get; set; }

        public int ModuleNumber { get; set; }

        public string ModuleName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public List<CourseTopicDto> Topics { get; set; }
            = new();
        public List<BatchModuleProgressDto> BatchProgress { get; set; }
    = new List<BatchModuleProgressDto>();
    }

    public class CourseTopicDto
    {
        public int TopicId { get; set; }

        public int TopicNumber { get; set; }

        public string TopicName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public List<CourseLessonDto> Lessons { get; set; }
            = new();
    }

    public class CourseLessonDto
    {
        public int LessonId { get; set; }

        public int LessonNumber { get; set; }

        public string LessonName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;


        public List<BatchModuleProgressDto> BatchProgress { get; set; }
        = new();

        public class BatchModuleProgressDto
        {
            public int BatchId { get; set; }

            // null = Unknown; false = Incomplete; true = Completed
            public bool? IsCompleted { get; set; }
        }

    }
}
