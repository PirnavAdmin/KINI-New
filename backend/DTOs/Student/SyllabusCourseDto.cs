namespace TalentSphereAPI.DTOs.StudentSyllabus
{
    public class SyllabusCourseDto
    {
        public int CourseId { get; set; }

        public string CourseName { get; set; } = string.Empty;

        public string CourseCode { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Duration { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public List<SyllabusModuleDto> Modules { get; set; }
            = new();
    }
}