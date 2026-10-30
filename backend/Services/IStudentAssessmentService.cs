using TalentSphereAPI.DTOs.StudentAssessment;
using TalentSphereAPI.DTOs.Organization;

namespace TalentSphereAPI.Services.Interfaces
{
    public interface IStudentAssessmentService
    {
        Task<List<AvailableAssessmentDto>>
            GetAvailableAssessmentsAsync(
                int studentId);

        Task<int> StartAssessmentAsync(
            int studentId,
            StartAssessmentDto dto);

        Task<AssessmentResultDto>
            SubmitAssessmentAsync(
                int studentId,
                SubmitAssessmentDto dto);

        Task<AssessmentResultDto?>
            GetResultAsync(
                int studentId,
                int studentAssessmentId);

        Task<StudentAssessmentDto?>
            GetAssessmentAsync(
                int studentId,
                int studentAssessmentId);

        Task<StudentAssessmentPerformanceDto?>
    GetStudentAssessmentPerformanceAsync(
        int studentId);

        Task<AssessmentStudentResultsResponseDto?>
    GetAssessmentStudentResultsAsync(
        int assessmentId,
        string? search,
        int pageNumber,
        int pageSize);
    }
}