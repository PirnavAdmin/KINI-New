namespace TalentSphereAPI.DTOs.Syllabus;

public class SyllabusPdfImportResponseDto
{
    public int CourseId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }

    public string Description { get; set; } = string.Empty;

    public SyllabusSummaryDto Summary { get; set; } = new();

    public List<SyllabusModuleImportDto> Modules { get; set; } = new();
}

public class SyllabusSummaryDto
{
    public int ModuleCount { get; set; }
    public int TopicCount { get; set; }
    public int LessonCount { get; set; }
}

public class SyllabusModuleImportDto
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public List<SyllabusTopicImportDto> Topics { get; set; } = new();
}

public class SyllabusTopicImportDto
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public List<SyllabusLessonImportDto> Lessons { get; set; } = new();
}

public class SyllabusLessonImportDto
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
}