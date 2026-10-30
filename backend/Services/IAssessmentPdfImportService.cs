using Microsoft.AspNetCore.Http;
using TalentSphereAPI.DTOs.AssessmentPdfImport;

namespace TalentSphereAPI.Services.Interfaces;

public interface IAssessmentPdfImportService
{
    Task<AssessmentPdfImportResponseDto> ImportAsync(
        IFormFile file,
        CancellationToken cancellationToken = default);
}