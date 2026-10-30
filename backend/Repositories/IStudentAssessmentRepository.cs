using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories.Interfaces
{
    public interface IStudentAssessmentRepository
    {
        Task<StudentAssessment?> GetByIdAsync(
            int studentAssessmentId);

        Task<StudentAssessment?> GetByStudentAndAssessmentAsync(
            int studentId,
            int assessmentId);

        Task<StudentAssessment?> GetLatestByStudentAndAssessmentAsync(
            int studentId,
            int assessmentId);

        Task<int> GetAttemptCountAsync(
            int studentId,
            int assessmentId);

        Task<Assessment?> GetAssessmentByIdAsync(
            int assessmentId);

        Task<Student?> GetStudentByIdAsync(
            int studentId);

        Task<List<Assessment>> GetAvailableAssessmentsAsync(
            int studentId);

        Task AddAsync(
            StudentAssessment studentAssessment);

        Task UpdateAsync(
            StudentAssessment studentAssessment);

        Task<List<AssessmentQuestion>> GetQuestionsAsync(
            int assessmentId);

        Task SaveStudentAnswersAsync(
            IEnumerable<StudentAssessmentAnswer> answers);

        Task<List<StudentAssessment>> GetAssessmentAttemptsForOrganizationAsync(
    int studentId);

        Task<int> GetAssignedAssessmentCountForOrganizationAsync(
            int studentId);

        Task<Assessment?> GetAssessmentForOrganizationResultsAsync(
    int assessmentId);

        Task<(List<Student> Students, int TotalCount)>
            GetStudentsForAssessmentResultsAsync(
                int courseId,
                int batchId,
                string? search,
                int pageNumber,
                int pageSize);

        Task<List<StudentAssessment>>
            GetAttemptsForAssessmentResultsAsync(
                int assessmentId,
                IEnumerable<int> studentIds);

        Task<int> SaveChangesAsync();
    }
}