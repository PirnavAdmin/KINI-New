namespace TalentSphereAPI.DTOs.CourseSyllabus
{
    public class CreateCourseSyllabusDto
    {
        public string Description { get; set; } = string.Empty;

        public List<CreateCourseModuleDto> Modules { get; set; }
            = new();
    }

    public class CreateCourseModuleDto
    {
        public int ModuleNumber { get; set; }

        public string ModuleName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public List<CreateCourseTopicDto> Topics { get; set; }
            = new();
    }

    public class CreateCourseTopicDto
    {
        public int TopicNumber { get; set; }

        public string TopicName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public List<CreateCourseLessonDto> Lessons { get; set; }
            = new();
    }

    public class CreateCourseLessonDto
    {
        public int LessonNumber { get; set; }

        public string LessonName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
    }
}