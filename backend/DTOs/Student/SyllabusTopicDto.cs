namespace TalentSphereAPI.DTOs.StudentSyllabus
{
    public class SyllabusTopicDto
    {
        public int TopicId { get; set; }

        public int TopicNumber { get; set; }

        public string TopicName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public List<SyllabusLessonDto> Lessons { get; set; }
            = new();
    }
}