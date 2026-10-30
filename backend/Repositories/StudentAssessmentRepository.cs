
using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories.Interfaces;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Repositories
{
    public class StudentAssessmentRepository
        : IStudentAssessmentRepository
    {
        private readonly ApplicationDbContext _context;

        private readonly ITenantContext _tenantContext;

        
        public StudentAssessmentRepository(
    ApplicationDbContext context,
    ITenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        // =========================================================
        // GET ATTEMPT BY ID
        // =========================================================

        public async Task<StudentAssessment?> GetByIdAsync(
            int studentAssessmentId)
        {
            return await _context.StudentAssessments
                .Include(sa => sa.Answers)
                .Include(sa => sa.Assessment)
                    .ThenInclude(a => a.Course)
                .Include(sa => sa.Assessment)
                    .ThenInclude(a => a.Batch)
                .FirstOrDefaultAsync(sa =>
                    sa.StudentAssessmentId == studentAssessmentId);
        }

        // =========================================================
        // GET LATEST ATTEMPT
        // =========================================================

        public async Task<StudentAssessment?>
            GetByStudentAndAssessmentAsync(
                int studentId,
                int assessmentId)
        {
            return await _context.StudentAssessments
                .Include(sa => sa.Answers)
                .Where(sa =>
                    sa.StudentId == studentId &&
                    sa.AssessmentId == assessmentId)
                .OrderByDescending(sa =>
                    sa.StudentAssessmentId)
                .FirstOrDefaultAsync();
        }

        // =========================================================
        // GET LATEST ATTEMPT FOR RETEST
        // =========================================================

        public async Task<StudentAssessment?>
            GetLatestByStudentAndAssessmentAsync(
                int studentId,
                int assessmentId)
        {
            return await _context.StudentAssessments
                .Where(sa =>
                    sa.StudentId == studentId &&
                    sa.AssessmentId == assessmentId)
                .OrderByDescending(sa =>
                    sa.StudentAssessmentId)
                .FirstOrDefaultAsync();
        }

        // =========================================================
        // ATTEMPT COUNT
        // =========================================================

        public async Task<int> GetAttemptCountAsync(
            int studentId,
            int assessmentId)
        {
            return await _context.StudentAssessments
                .CountAsync(sa =>
                    sa.StudentId == studentId &&
                    sa.AssessmentId == assessmentId);
        }

        // =========================================================
        // GET ASSESSMENT
        // =========================================================

        public async Task<Assessment?> GetAssessmentByIdAsync(
            int assessmentId)
        {
            return await _context.Assessments
                .Include(a => a.Course)
                .Include(a => a.Batch)
                .Include(a => a.Questions)
                    .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(a =>
                    a.AssessmentId == assessmentId);
        }

        // =========================================================
        // GET STUDENT
        // =========================================================

        public async Task<Student?> GetStudentByIdAsync(
    int studentId)
        {
            var organizationId =
                _tenantContext.OrganizationId;

            return await _context.Students
                .Include(s => s.Course)
                .Include(s => s.Batch)
                .AsNoTracking()
                .FirstOrDefaultAsync(s =>
                    s.StudentId == studentId &&
                    s.OrganizationId == organizationId &&
                    !s.IsDeleted);
        }
        // =========================================================
        // GET AVAILABLE ASSESSMENTS
        // =========================================================
        //
        // An assessment is available to a student only when:
        //
        // 1. Assessment is Published
        // 2. Assessment CourseId matches student's CourseId
        // 3. Assessment BatchId matches student's BatchId
        // 4. Assessment StartDate has been reached
        // 5. Assessment EndDate has not passed
        //
        // Retake rules are intentionally NOT handled here.
        //
        // Retake rules remain in StudentAssessmentService:
        //
        // Passed  -> NO retake
        // Failed  -> NEW attempt
        // InProgress -> RESUME existing attempt
        //
        // =========================================================

        public async Task<List<Assessment>>
    GetAvailableAssessmentsAsync(
        int studentId)
        {
            var organizationId =
                _tenantContext.OrganizationId;

            var student =
                await _context.Students
                    .AsNoTracking()
                    .FirstOrDefaultAsync(s =>
                        s.StudentId == studentId &&
                        s.OrganizationId == organizationId &&
                        !s.IsDeleted);

            if (student == null)
            {
                return new List<Assessment>();
            }

            // IMPORTANT:
            // Assessment StartDate and EndDate are stored in UTC.
            var nowUtc =
                DateTime.UtcNow;

            return await _context.Assessments
                .AsNoTracking()

                .Include(a => a.Course)

                .Include(a => a.Batch)

                .Where(a =>
                    // Published
                    a.Status == "Published" &&

                    // Same course
                    a.CourseId == student.CourseId &&

                    // Same batch
                    a.BatchId == student.BatchId &&

                    // Availability has started
                    a.StartDate <= nowUtc &&

                    // Availability has not ended
                    a.EndDate >= nowUtc)

                .OrderBy(a => a.StartDate)

                .ToListAsync();
        }
        
        // =========================================================
        // ORGANIZATION - GET STUDENT ASSESSMENT ATTEMPTS
        // =========================================================

        public async Task<List<StudentAssessment>>
            GetAssessmentAttemptsForOrganizationAsync(
                int studentId)
        {
            var organizationId =
                _tenantContext.OrganizationId;

            return await _context.StudentAssessments
                .AsNoTracking()

                .Include(sa => sa.Student)

                .Include(sa => sa.Assessment)
                    .ThenInclude(a => a.Course)

                .Include(sa => sa.Assessment)
                    .ThenInclude(a => a.Batch)

                .Include(sa => sa.Assessment)
                    .ThenInclude(a => a.Questions)

                .Include(sa => sa.Answers)

                .Where(sa =>
    sa.StudentId == studentId &&
    sa.Student.OrganizationId == organizationId &&
    sa.Assessment.Batch.OrganizationId == organizationId &&
    !sa.Student.IsDeleted)

                .OrderBy(sa => sa.AssessmentId)

                .ThenBy(sa => sa.StartedAt)

                .ToListAsync();
        }


        // =========================================================
        // ORGANIZATION - ASSIGNED ASSESSMENT COUNT
        // =========================================================

        public async Task<int>
            GetAssignedAssessmentCountForOrganizationAsync(
                int studentId)
        {
            var organizationId =
                _tenantContext.OrganizationId;

            var student =
                await _context.Students
                    .AsNoTracking()
                    .FirstOrDefaultAsync(s =>
                        s.StudentId == studentId &&
                        s.OrganizationId == organizationId &&
                        !s.IsDeleted);

            if (student == null)
            {
                return 0;
            }

            return await _context.Assessments
                .AsNoTracking()
                .Where(a =>
                    a.CourseId == student.CourseId &&
                    a.BatchId == student.BatchId &&
                    a.Batch.OrganizationId == organizationId &&

                    (
                        a.Status == "Published" ||
                        a.Status == "Completed"
                    ))
                .CountAsync();
        }

        // =========================================================
        // ADD STUDENT ATTEMPT
        // =========================================================

        public async Task AddAsync(
            StudentAssessment studentAssessment)
        {
            await _context.StudentAssessments
                .AddAsync(studentAssessment);
        }

        // =========================================================
        // UPDATE STUDENT ATTEMPT
        // =========================================================

        public Task UpdateAsync(
            StudentAssessment studentAssessment)
        {
            _context.StudentAssessments
                .Update(studentAssessment);

            return Task.CompletedTask;
        }

        // =========================================================
        // GET QUESTIONS
        // =========================================================

        public async Task<List<AssessmentQuestion>>
            GetQuestionsAsync(
                int assessmentId)
        {
            return await _context.AssessmentQuestions
                .AsNoTracking()
                .Include(q => q.Options)
                .Where(q =>
                    q.AssessmentId == assessmentId)
                .OrderBy(q => q.OrderNo)
                .ToListAsync();
        }

        // =========================================================
        // SAVE STUDENT ANSWERS
        // =========================================================

        public async Task SaveStudentAnswersAsync(
            IEnumerable<StudentAssessmentAnswer> answers)
        {
            if (answers == null)
            {
                return;
            }

            await _context.StudentAssessmentAnswers
                .AddRangeAsync(answers);
        }

        // =========================================================
        // ORGANIZATION - GET ASSESSMENT FOR STUDENT RESULTS
        // =========================================================

        public async Task<Assessment?>
            GetAssessmentForOrganizationResultsAsync(
                int assessmentId)
        {
            var organizationId =
                _tenantContext.OrganizationId;

            return await _context.Assessments
                .AsNoTracking()

                .Include(a => a.Course)

                .Include(a => a.Batch)

                .FirstOrDefaultAsync(a =>
                    a.AssessmentId == assessmentId &&

                    a.Batch.OrganizationId == organizationId &&

                    a.Course.OrganizationId == organizationId);
        }


        // =========================================================
        // ORGANIZATION - GET STUDENTS ASSIGNED TO ASSESSMENT
        // =========================================================

        public async Task<(List<Student> Students, int TotalCount)>
            GetStudentsForAssessmentResultsAsync(
                int courseId,
                int batchId,
                string? search,
                int pageNumber,
                int pageSize)
        {
            var organizationId =
                _tenantContext.OrganizationId;

            var query =
                _context.Students
                    .AsNoTracking()

                    .Include(s => s.Course)

                    .Include(s => s.Batch)

                    .Where(s =>
                        s.OrganizationId == organizationId &&

                        s.CourseId == courseId &&

                        s.BatchId == batchId &&

                        !s.IsDeleted);

            // ---------------------------------------------
            // SEARCH
            // ---------------------------------------------

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();

                query = query.Where(s =>
                    s.FirstName.Contains(search) ||

                    s.LastName.Contains(search) ||

                    (s.FirstName + " " + s.LastName)
                        .Contains(search) ||

                    s.Email.Contains(search) ||

                    s.Phone.Contains(search));
            }

            // ---------------------------------------------
            // TOTAL COUNT
            // ---------------------------------------------

            var totalCount =
                await query.CountAsync();

            // ---------------------------------------------
            // PAGINATION
            // ---------------------------------------------

            var students =
                await query

                    .OrderBy(s => s.FirstName)

                    .ThenBy(s => s.LastName)

                    .ThenBy(s => s.StudentId)

                    .Skip(
                        (pageNumber - 1) *
                        pageSize)

                    .Take(pageSize)

                    .ToListAsync();

            return (
                students,
                totalCount);
        }


        // =========================================================
        // ORGANIZATION - GET ALL ATTEMPTS FOR ASSESSMENT
        // =========================================================

        public async Task<List<StudentAssessment>>
            GetAttemptsForAssessmentResultsAsync(
                int assessmentId,
                IEnumerable<int> studentIds)
        {
            var organizationId =
                _tenantContext.OrganizationId;

            var ids =
                studentIds
                    .Distinct()
                    .ToList();

            if (ids.Count == 0)
            {
                return new List<StudentAssessment>();
            }

            return await _context.StudentAssessments
                .AsNoTracking()

                .Include(sa => sa.Student)

                .Where(sa =>
                    sa.AssessmentId == assessmentId &&

                    ids.Contains(sa.StudentId) &&

                    sa.Student.OrganizationId ==
                        organizationId &&

                    !sa.Student.IsDeleted)

                .OrderBy(sa => sa.StudentId)

                .ThenBy(sa => sa.StartedAt)

                .ToListAsync();
        }

        // =========================================================
        // SAVE CHANGES
        // =========================================================

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}

