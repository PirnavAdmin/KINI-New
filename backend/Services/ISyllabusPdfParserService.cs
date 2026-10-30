using TalentSphereAPI.DTOs.Syllabus;

namespace TalentSphereAPI.Services.Interfaces;

public interface ISyllabusPdfParserService
{
    Task<SyllabusPdfImportResponseDto> ParseAsync(
        Stream pdfStream,
        string fileName,
        long fileSize,
        int courseId);
}