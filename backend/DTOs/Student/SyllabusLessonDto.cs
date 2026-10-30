namespace TalentSphereAPI.DTOs.StudentSyllabus
{
    public class SyllabusLessonDto
    {
        public int LessonId { get; set; }

        public int LessonNumber { get; set; }

        public string LessonName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
    }
}