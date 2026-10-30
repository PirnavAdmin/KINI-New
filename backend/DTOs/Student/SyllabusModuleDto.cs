namespace TalentSphereAPI.DTOs.StudentSyllabus
{
    public class SyllabusModuleDto
    {
        public int ModuleId { get; set; }

        public int ModuleNumber { get; set; }

        public string ModuleName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public List<SyllabusTopicDto> Topics { get; set; }
            = new();
    }
}