using TalentSphereAPI.DTOs.StudentAssessment;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories.Interfaces;
using TalentSphereAPI.Services.Interfaces;
using TalentSphereAPI.DTOs.Organization;

namespace TalentSphereAPI.Services
{
    public class StudentAssessmentService
        : IStudentAssessmentService
    {
        private readonly IStudentAssessmentRepository _repository;

        public StudentAssessmentService(
            IStudentAssessmentRepository repository)
        {
            _repository = repository;
        }

        // =========================================================
        // AVAILABLE ASSESSMENTS
        // =========================================================

        public async Task<List<AvailableAssessmentDto>>
            GetAvailableAssessmentsAsync(
                int studentId)
        {
            if (studentId <= 0)
            {
                throw new ArgumentException(
                    "Invalid student.");
            }

            var assessments =
                await _repository
                    .GetAvailableAssessmentsAsync(
                        studentId);

            var result =
                new List<AvailableAssessmentDto>();

            foreach (var assessment in assessments)
            {
                var latestAttempt =
                    await _repository
                        .GetLatestByStudentAndAssessmentAsync(
                            studentId,
                            assessment.AssessmentId);

                var attemptCount =
                    await _repository
                        .GetAttemptCountAsync(
                            studentId,
                            assessment.AssessmentId);

                var alreadyStarted =
                    latestAttempt != null;

                var alreadySubmitted =
                    latestAttempt != null &&
                    string.Equals(
                        latestAttempt.Status,
                        "Submitted",
                        StringComparison.OrdinalIgnoreCase);

                string? latestResult =
                    alreadySubmitted
                        ? latestAttempt!.Result
                        : null;

                var canRetake =
                    alreadySubmitted &&
                    string.Equals(
                        latestAttempt!.Result,
                        "Fail",
                        StringComparison.OrdinalIgnoreCase);

                result.Add(
                    new AvailableAssessmentDto
                    {
                        AssessmentId =
                            assessment.AssessmentId,

                        Title =
                            assessment.Title,

                        Description =
                            assessment.Description
                            ?? string.Empty,

                        CourseName =
                            assessment.Course?.CourseName
                            ?? string.Empty,

                        BatchName =
                            assessment.Batch?.BatchName
                            ?? string.Empty,

                        TotalMarks =
                            assessment.TotalMarks,

                        PassingMarks =
                            assessment.PassingMarks,

                        DurationMinutes =
                            assessment.DurationMinutes,

                        AssessmentType =
                            assessment.AssessmentType,

                        StartDate =
                            assessment.StartDate,

                        EndDate =
                            assessment.EndDate,

                        Status =
                            assessment.Status,

                        AlreadyStarted =
                            alreadyStarted,

                        AlreadySubmitted =
                            alreadySubmitted,

                        LatestResult =
                            latestResult,

                        CanRetake =
                            canRetake,

                        AttemptNumber =
                            attemptCount,

                        StudentAssessmentId =
                            latestAttempt?
                                .StudentAssessmentId
                    });
            }

            return result;
        }
        // =========================================================
        // ORGANIZATION - STUDENT ASSESSMENT PERFORMANCE
        // =========================================================

        public async Task<StudentAssessmentPerformanceDto?>
            GetStudentAssessmentPerformanceAsync(
                int studentId)
        {
            if (studentId <= 0)
            {
                return null;
            }

            var attempts =
                await _repository
                    .GetAssessmentAttemptsForOrganizationAsync(
                        studentId);

            if (attempts == null ||
                attempts.Count == 0)
            {
                var student =
                    await _repository
                        .GetStudentByIdAsync(studentId);

                if (student == null)
                {
                    return null;
                }

                var assignedCount =
                    await _repository
                        .GetAssignedAssessmentCountForOrganizationAsync(
                            studentId);

                return new StudentAssessmentPerformanceDto
                {
                    StudentId =
                        student.StudentId,

                    StudentName =
                        $"{student.FirstName} {student.LastName}"
                            .Trim(),

                    Email =
                        student.Email,

                    CourseName =
                        student.Course?.CourseName
                        ?? string.Empty,

                    BatchName =
                        student.Batch?.BatchName
                        ?? string.Empty,

                    TotalAssessmentsAssigned =
                        assignedCount,

                    AssessmentsTaken =
                        0,

                    TotalAttempts =
                        0,

                    CompletedAttempts =
                        0,

                    InProgressAttempts =
                        0,

                    PassedAssessments =
                        0,

                    FailedAssessments =
                        0,

                    AveragePercentage =
                        0
                };
            }

            var firstAttempt =
                attempts.First();

            var studentInfo =
                firstAttempt.Student;

            var assignedAssessments =
                await _repository
                    .GetAssignedAssessmentCountForOrganizationAsync(
                        studentId);

            // ---------------------------------------------------------
            // ATTEMPT NUMBER
            // ---------------------------------------------------------

            var attemptNumbers =
    attempts
        .GroupBy(x => x.AssessmentId)
        .SelectMany(group =>
            group
                .OrderBy(x => x.StartedAt)
                .Select((x, index) => new
                {
                    x.StudentAssessmentId,
                    AttemptNumber = index + 1
                }))
        .ToDictionary(
            x => x.StudentAssessmentId,
            x => x.AttemptNumber);
            // ---------------------------------------------------------
            // ONLY SUBMITTED ATTEMPTS ARE COUNTED AS "TAKEN"
            // ---------------------------------------------------------

            var submittedAttempts =
                attempts
                    .Where(x =>
                        string.Equals(
                            x.Status,
                            "Submitted",
                            StringComparison.OrdinalIgnoreCase))
                    .ToList();

            var assessmentsTaken =
                submittedAttempts
                    .Select(x => x.AssessmentId)
                    .Distinct()
                    .Count();

            var passedAssessments =
                submittedAttempts
                    .Count(x =>
                        string.Equals(
                            x.Result,
                            "Pass",
                            StringComparison.OrdinalIgnoreCase));

            var failedAssessments =
                submittedAttempts
                    .Count(x =>
                        string.Equals(
                            x.Result,
                            "Fail",
                            StringComparison.OrdinalIgnoreCase));

            var averagePercentage =
                submittedAttempts.Count == 0
                    ? 0
                    : Math.Round(
                        submittedAttempts
                            .Average(x => x.Percentage),
                        2);

            // ---------------------------------------------------------
            // RESULT LIST
            // ---------------------------------------------------------

            var results =
                attempts
                    .OrderByDescending(x => x.StartedAt)
                    .Select(x =>
                    {
                        var totalQuestions =
                            x.Assessment?.Questions?.Count ?? 0;

                        var correctAnswers =
                            x.Answers?.Count(a => a.IsCorrect)
                            ?? 0;

                        var wrongAnswers =
                            x.Answers?.Count(a => !a.IsCorrect)
                            ?? 0;

                        var attemptNumber =
                            attemptNumbers.TryGetValue(
                                x.StudentAssessmentId,
                                out var number)
                                ? number
                                : 1;
                        
                    

                        return new StudentAssessmentPerformanceItemDto
                        {
                            StudentAssessmentId =
                                x.StudentAssessmentId,

                            AssessmentId =
                                x.AssessmentId,

                            AssessmentTitle =
                                x.Assessment?.Title
                                ?? string.Empty,

                            CourseName =
                                x.Assessment?.Course?.CourseName
                                ?? string.Empty,

                            BatchName =
                                x.Assessment?.Batch?.BatchName
                                ?? string.Empty,

                            AttemptNumber =
                                attemptNumber,

                            StartedAt =
                                x.StartedAt,

                            SubmittedAt =
                                x.SubmittedAt,

                            Status =
                                x.Status,

                            Score =
                                x.Score,

                            TotalMarks =
                                x.Assessment?.TotalMarks ?? 0,

                            Percentage =
                                x.Percentage,

                            Result =
                                x.Result,

                            TotalQuestions =
                                totalQuestions,

                            CorrectAnswers =
                                correctAnswers,

                            WrongAnswers =
                                wrongAnswers
                        };
                    })
                    .ToList();

            return new StudentAssessmentPerformanceDto
            {
                StudentId =
                    studentInfo.StudentId,

                StudentName =
                    $"{studentInfo.FirstName} {studentInfo.LastName}"
                        .Trim(),

                Email =
                    studentInfo.Email,

                CourseName =
                    studentInfo.Course?.CourseName
                    ?? firstAttempt.Assessment?.Course?.CourseName
                    ?? string.Empty,

                BatchName =
                    studentInfo.Batch?.BatchName
                    ?? firstAttempt.Assessment?.Batch?.BatchName
                    ?? string.Empty,

                TotalAssessmentsAssigned =
                    assignedAssessments,

                AssessmentsTaken =
                    assessmentsTaken,

                TotalAttempts =
                    attempts.Count,

                CompletedAttempts =
                    submittedAttempts.Count,

                InProgressAttempts =
                    attempts.Count(x =>
                        !string.Equals(
                            x.Status,
                            "Submitted",
                            StringComparison.OrdinalIgnoreCase)),

                PassedAssessments =
                    passedAssessments,

                FailedAssessments =
                    failedAssessments,

                AveragePercentage =
                    averagePercentage,

                Results =
                    results
            };
        }
        // =========================================================
        // START / RETAKE
        // =========================================================

        public async Task<int> StartAssessmentAsync(
            int studentId,
            StartAssessmentDto dto)
        {
            if (studentId <= 0)
            {
                throw new ArgumentException(
                    "Invalid student.");
            }

            if (dto == null ||
                dto.AssessmentId <= 0)
            {
                throw new ArgumentException(
                    "Invalid assessment.");
            }

            var student =
                await _repository
                    .GetStudentByIdAsync(
                        studentId);

            if (student == null)
            {
                throw new ArgumentException(
                    "Student not found.");
            }

            var assessment =
                await _repository
                    .GetAssessmentByIdAsync(
                        dto.AssessmentId);

            if (assessment == null)
            {
                throw new ArgumentException(
                    "Assessment not found.");
            }

            // =====================================================
            // COURSE
            // =====================================================

            if (assessment.CourseId !=
                student.CourseId)
            {
                throw new UnauthorizedAccessException(
                    "This assessment is not assigned to your course.");
            }

            // =====================================================
            // BATCH
            // =====================================================

            if (assessment.BatchId !=
                student.BatchId)
            {
                throw new UnauthorizedAccessException(
                    "This assessment is not assigned to your batch.");
            }

            // =====================================================
            // PUBLISHED
            // =====================================================

            if (!string.Equals(
                    assessment.Status,
                    "Published",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "This assessment is not published.");
            }

            var now =
                DateTime.UtcNow;

            // =====================================================
            // START DATE
            // =====================================================

            if (now < assessment.StartDate)
            {
                throw new InvalidOperationException(
                    "This assessment has not started yet.");
            }

            // =====================================================
            // END DATE
            // =====================================================

            if (now > assessment.EndDate)
            {
                throw new InvalidOperationException(
                    "This assessment has already ended.");
            }

            // =====================================================
            // LATEST ATTEMPT
            // =====================================================

            var latestAttempt =
                await _repository
                    .GetLatestByStudentAndAssessmentAsync(
                        studentId,
                        dto.AssessmentId);

            // =====================================================
            // NO ATTEMPT
            // =====================================================

            if (latestAttempt == null)
            {
                return await CreateNewAttemptAsync(
                    studentId,
                    assessment,
                    now);
            }

            // =====================================================
            // EXISTING IN-PROGRESS ATTEMPT
            // =====================================================

            if (string.Equals(
                    latestAttempt.Status,
                    "InProgress",
                    StringComparison.OrdinalIgnoreCase))
            {
                // IMPORTANT:
                // If the timer already expired, submit the
                // attempt before allowing it to continue.

                var deadline =
                    CalculateSubmissionDeadline(
                        latestAttempt.StartedAt,
                        assessment);

                if (now >= deadline)
                {
                    await AutoSubmitAttemptAsync(
                        latestAttempt,
                        assessment);

                    throw new InvalidOperationException(
                        "The assessment time has expired and the attempt was automatically submitted.");
                }

                return latestAttempt.StudentAssessmentId;
            }

            // =====================================================
            // PASSED
            // =====================================================

            if (string.Equals(
                    latestAttempt.Status,
                    "Submitted",
                    StringComparison.OrdinalIgnoreCase) &&
                string.Equals(
                    latestAttempt.Result,
                    "Pass",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "You have already passed this assessment. Retest is not required.");
            }

            // =====================================================
            // FAILED -> NEW RETEST
            // =====================================================

            if (string.Equals(
                    latestAttempt.Status,
                    "Submitted",
                    StringComparison.OrdinalIgnoreCase) &&
                string.Equals(
                    latestAttempt.Result,
                    "Fail",
                    StringComparison.OrdinalIgnoreCase))
            {
                return await CreateNewAttemptAsync(
                    studentId,
                    assessment,
                    now);
            }

            throw new InvalidOperationException(
                "Unable to start this assessment.");
        }

        // =========================================================
        // CREATE NEW ATTEMPT
        // =========================================================

        private async Task<int> CreateNewAttemptAsync(
            int studentId,
            Assessment assessment,
            DateTime startedAt)
        {
            var studentAssessment =
                new StudentAssessment
                {
                    StudentId =
                        studentId,

                    AssessmentId =
                        assessment.AssessmentId,

                    StartedAt =
                        startedAt,

                    Status =
                        "InProgress",

                    Result =
                        "Pending",

                    Score =
                        0,

                    Percentage =
                        0,

                    SubmittedAt =
                        null
                };

            await _repository
                .AddAsync(
                    studentAssessment);

            await _repository
                .SaveChangesAsync();

            return studentAssessment
                .StudentAssessmentId;
        }

        // =========================================================
        // CALCULATE DEADLINE
        // =========================================================

        private DateTime CalculateSubmissionDeadline(
            DateTime startedAt,
            Assessment assessment)
        {
            var durationDeadline =
                startedAt.AddMinutes(
                    assessment.DurationMinutes);

            // The student must finish before BOTH:
            //
            // 1. Their personal duration expires
            // 2. Assessment window closes
            //
            // Therefore use the earlier deadline.

            return durationDeadline <= assessment.EndDate
                ? durationDeadline
                : assessment.EndDate;
        }

        // =========================================================
        // GET ASSESSMENT
        // =========================================================

        public async Task<StudentAssessmentDto?>
            GetAssessmentAsync(
                int studentId,
                int studentAssessmentId)
        {
            if (studentId <= 0 ||
                studentAssessmentId <= 0)
            {
                return null;
            }

            var studentAssessment =
                await _repository
                    .GetByIdAsync(
                        studentAssessmentId);

            if (studentAssessment == null)
            {
                return null;
            }

            // =====================================================
            // OWNERSHIP
            // =====================================================

            if (studentAssessment.StudentId !=
                studentId)
            {
                return null;
            }

            var assessment =
                await _repository
                    .GetAssessmentByIdAsync(
                        studentAssessment.AssessmentId);

            if (assessment == null)
            {
                return null;
            }

            var questions =
                await _repository
                    .GetQuestionsAsync(
                        assessment.AssessmentId);

            // =====================================================
            // TIMER
            // =====================================================

            DateTime? submissionDeadline = null;

            var remainingSeconds = 0;

            if (string.Equals(
                    studentAssessment.Status,
                    "InProgress",
                    StringComparison.OrdinalIgnoreCase))
            {
                submissionDeadline =
                    CalculateSubmissionDeadline(
                        studentAssessment.StartedAt,
                        assessment);

                var remaining =
                    submissionDeadline.Value -
                    DateTime.UtcNow;

                remainingSeconds =
                    Math.Max(
                        0,
                        (int)Math.Floor(
                            remaining.TotalSeconds));

                // =================================================
                // TIMER EXPIRED
                // =================================================

                if (remainingSeconds <= 0)
                {
                    await AutoSubmitAttemptAsync(
                        studentAssessment,
                        assessment);

                    // Refresh status for response.
                    studentAssessment.Status =
                        "Submitted";

                    studentAssessment.Result =
                        "Fail";

                    remainingSeconds = 0;
                }
            }

            // =====================================================
            // DTO
            // =====================================================

            var dto =
                new StudentAssessmentDto
                {
                    StudentAssessmentId =
                        studentAssessment
                            .StudentAssessmentId,

                    AssessmentId =
                        assessment.AssessmentId,

                    StudentId =
                        studentAssessment.StudentId,

                    Title =
                        assessment.Title,

                    Description =
                        assessment.Description,

                    CourseName =
                        assessment.Course?.CourseName
                        ?? string.Empty,

                    BatchName =
                        assessment.Batch?.BatchName
                        ?? string.Empty,

                    TotalMarks =
                        assessment.TotalMarks,

                    PassingMarks =
                        assessment.PassingMarks,

                    DurationMinutes =
                        assessment.DurationMinutes,

                    AssessmentType =
                        assessment.AssessmentType,

                    StartDate =
                        assessment.StartDate,

                    EndDate =
                        assessment.EndDate,

                    StartedAt =
                        studentAssessment.StartedAt,

                    SubmissionDeadline =
                        submissionDeadline,

                    RemainingSeconds =
                        remainingSeconds,

                    Status =
                        studentAssessment.Status
                };

            // =====================================================
            // QUESTIONS
            // =====================================================

            foreach (var question in questions)
            {
                dto.Questions.Add(
                    new StudentAssessmentQuestionDto
                    {
                        QuestionId =
                            question.QuestionId,

                        QuestionText =
                            question.QuestionText,

                        QuestionType =
                            question.QuestionType,

                        Difficulty =
                            question.Difficulty,

                        Marks =
                            question.Marks,

                        OrderNo =
                            question.OrderNo,

                        // NEVER expose IsCorrect.
                        Options =
                            question.Options
                                .OrderBy(o =>
                                    o.OptionId)
                                .Select(o =>
                                    new StudentAssessmentOptionDto
                                    {
                                        OptionId =
                                            o.OptionId,

                                        OptionText =
                                            o.OptionText
                                    })
                                .ToList()
                    });
            }

            return dto;
        }

        // =========================================================
        // SUBMIT
        // =========================================================

        public async Task<AssessmentResultDto>
            SubmitAssessmentAsync(
                int studentId,
                SubmitAssessmentDto dto)
        {
            if (studentId <= 0)
            {
                throw new ArgumentException(
                    "Invalid student.");
            }

            if (dto == null)
            {
                throw new ArgumentException(
                    "Invalid submission.");
            }

            var studentAssessment =
                await _repository
                    .GetByIdAsync(
                        dto.StudentAssessmentId);

            if (studentAssessment == null)
            {
                throw new ArgumentException(
                    "Assessment attempt not found.");
            }

            // =====================================================
            // OWNERSHIP
            // =====================================================

            if (studentAssessment.StudentId !=
                studentId)
            {
                throw new UnauthorizedAccessException(
                    "You are not allowed to submit this assessment.");
            }

            // =====================================================
            // DOUBLE SUBMISSION
            // =====================================================

            if (string.Equals(
                    studentAssessment.Status,
                    "Submitted",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "This assessment has already been submitted.");
            }

            var assessment =
                await _repository
                    .GetAssessmentByIdAsync(
                        studentAssessment.AssessmentId);

            if (assessment == null)
            {
                throw new ArgumentException(
                    "Assessment not found.");
            }

            // =====================================================
            // CHECK TIMER
            // =====================================================

            var deadline =
                CalculateSubmissionDeadline(
                    studentAssessment.StartedAt,
                    assessment);

            var isExpired =
                DateTime.UtcNow >= deadline;

            // =====================================================
            // QUESTIONS
            // =====================================================

            var questions =
                await _repository
                    .GetQuestionsAsync(
                        assessment.AssessmentId);

            if (questions.Count == 0)
            {
                throw new InvalidOperationException(
                    "This assessment has no questions.");
            }

            // =====================================================
            // ANSWERS
            // =====================================================

            var submittedAnswers =
                dto.Answers ??
                new List<StudentAnswerDto>();

            // =====================================================
            // DUPLICATES
            // =====================================================

            if (submittedAnswers
                .GroupBy(a => a.QuestionId)
                .Any(g => g.Count() > 1))
            {
                throw new ArgumentException(
                    "Only one answer is allowed per question.");
            }

            // =====================================================
            // VALID QUESTIONS
            // =====================================================

            var validQuestionIds =
                questions
                    .Select(q =>
                        q.QuestionId)
                    .ToHashSet();

            foreach (var answer in submittedAnswers)
            {
                if (!validQuestionIds.Contains(
                        answer.QuestionId))
                {
                    throw new ArgumentException(
                        "One or more submitted questions do not belong to this assessment.");
                }
            }

            // =====================================================
            // SCORE
            // =====================================================

            decimal score = 0;

            var answers =
                new List<StudentAssessmentAnswer>();

            foreach (var question in questions)
            {
                var submitted =
                    submittedAnswers
                        .FirstOrDefault(
                            a =>
                                a.QuestionId ==
                                question.QuestionId);

                // No answer.
                if (submitted == null)
                {
                    continue;
                }

                var selectedOption =
                    question.Options
                        .FirstOrDefault(
                            o =>
                                o.OptionId ==
                                submitted.SelectedOptionId);

                if (selectedOption == null)
                {
                    throw new ArgumentException(
                        $"Selected option is invalid for question {question.QuestionId}.");
                }

                var isCorrect =
                    selectedOption.IsCorrect;

                var marksAwarded =
                    isCorrect
                        ? question.Marks
                        : 0;

                if (isCorrect)
                {
                    score += question.Marks;
                }

                answers.Add(
                    new StudentAssessmentAnswer
                    {
                        StudentAssessmentId =
                            studentAssessment
                                .StudentAssessmentId,

                        QuestionId =
                            question.QuestionId,

                        SelectedOptionId =
                            submitted.SelectedOptionId,

                        AnswerText =
                            null,

                        IsCorrect =
                            isCorrect,

                        MarksAwarded =
                            marksAwarded
                    });
            }

            // =====================================================
            // TOTAL
            // =====================================================

            var totalMarks =
                questions.Sum(q =>
                    q.Marks);

            // =====================================================
            // PERCENTAGE
            // =====================================================

            var percentage =
                totalMarks <= 0
                    ? 0
                    : Math.Round(
                        score * 100 /
                        totalMarks,
                        2);

            // =====================================================
            // PASS / FAIL
            // =====================================================

            var result =
                score >= assessment.PassingMarks
                    ? "Pass"
                    : "Fail";

            // =====================================================
            // SAVE ANSWERS
            // =====================================================

            await _repository
                .SaveStudentAnswersAsync(
                    answers);

            // =====================================================
            // UPDATE ATTEMPT
            // =====================================================

            studentAssessment.Score =
                score;

            studentAssessment.Percentage =
                percentage;

            studentAssessment.Result =
                result;

            studentAssessment.Status =
                "Submitted";

            studentAssessment.SubmittedAt =
                DateTime.UtcNow;

            await _repository
                .UpdateAsync(
                    studentAssessment);

            await _repository
                .SaveChangesAsync();

            // =====================================================
            // RESULT
            // =====================================================

            return new AssessmentResultDto
            {
                StudentAssessmentId =
                    studentAssessment
                        .StudentAssessmentId,

                Score =
                    score,

                Percentage =
                    percentage,

                Result =
                    result,

                TotalQuestions =
                    questions.Count,

                CorrectAnswers =
                    answers.Count(
                        a =>
                            a.IsCorrect),

                WrongAnswers =
                    answers.Count(
                        a =>
                            !a.IsCorrect),

                WasAutoSubmitted =
                    isExpired
            };
        }

        // =========================================================
        // AUTO SUBMIT
        // =========================================================

        private async Task AutoSubmitAttemptAsync(
            StudentAssessment studentAssessment,
            Assessment assessment)
        {
            if (string.Equals(
                    studentAssessment.Status,
                    "Submitted",
                    StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            var questions =
                await _repository
                    .GetQuestionsAsync(
                        assessment.AssessmentId);

            // =====================================================
            // TIME EXPIRED
            //
            // Any unanswered questions receive zero marks.
            // Existing submitted answers are not available here
            // because this system saves answers at final submission.
            // Therefore expiry submission receives zero.
            // =====================================================

            studentAssessment.Score =
                0;

            studentAssessment.Percentage =
                0;

            studentAssessment.Result =
                "Fail";

            studentAssessment.Status =
                "Submitted";

            studentAssessment.SubmittedAt =
                DateTime.UtcNow;

            await _repository
                .UpdateAsync(
                    studentAssessment);

            await _repository
                .SaveChangesAsync();
        }

        // =========================================================
        // GET RESULT
        // =========================================================

        public async Task<AssessmentResultDto?>
            GetResultAsync(
                int studentId,
                int studentAssessmentId)
        {
            if (studentId <= 0 ||
                studentAssessmentId <= 0)
            {
                return null;
            }

            var studentAssessment =
                await _repository
                    .GetByIdAsync(
                        studentAssessmentId);

            if (studentAssessment == null)
            {
                return null;
            }

            // =====================================================
            // OWNERSHIP
            // =====================================================

            if (studentAssessment.StudentId !=
                studentId)
            {
                return null;
            }

            // =====================================================
            // MUST BE SUBMITTED
            // =====================================================

            if (!string.Equals(
                    studentAssessment.Status,
                    "Submitted",
                    StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            var questions =
                await _repository
                    .GetQuestionsAsync(
                        studentAssessment.AssessmentId);

            return new AssessmentResultDto
            {
                StudentAssessmentId =
                    studentAssessment
                        .StudentAssessmentId,

                Score =
                    studentAssessment.Score,

                Percentage =
                    studentAssessment.Percentage,

                Result =
                    studentAssessment.Result,

                TotalQuestions =
                    questions.Count,

                CorrectAnswers =
                    studentAssessment.Answers
                        .Count(
                            a =>
                                a.IsCorrect),

                WrongAnswers =
                    studentAssessment.Answers
                        .Count(
                            a =>
                                !a.IsCorrect),

                WasAutoSubmitted =
                    false
            };
        }
        // =========================================================
        // ORGANIZATION - ALL STUDENTS ASSESSMENT RESULTS
        // =========================================================

        public async Task<AssessmentStudentResultsResponseDto?>
            GetAssessmentStudentResultsAsync(
                int assessmentId,
                string? search,
                int pageNumber,
                int pageSize)
        {
            if (assessmentId <= 0)
            {
                return null;
            }

            // ---------------------------------------------
            // NORMALIZE PAGINATION
            // ---------------------------------------------

            if (pageNumber <= 0)
            {
                pageNumber = 1;
            }

            if (pageSize <= 0)
            {
                pageSize = 10;
            }

            // Prevent extremely large requests
            if (pageSize > 100)
            {
                pageSize = 100;
            }

            // ---------------------------------------------
            // GET ASSESSMENT
            // ---------------------------------------------

            var assessment =
                await _repository
                    .GetAssessmentForOrganizationResultsAsync(
                        assessmentId);

            if (assessment == null)
            {
                return null;
            }

            // ---------------------------------------------
            // GET STUDENTS ASSIGNED TO THIS ASSESSMENT
            //
            // Assessment is assigned based on:
            // CourseId + BatchId
            // ---------------------------------------------

            var studentResult =
                await _repository
                    .GetStudentsForAssessmentResultsAsync(
                        assessment.CourseId,
                        assessment.BatchId,
                        search,
                        pageNumber,
                        pageSize);

            var students =
                studentResult.Students;

            var totalCount =
                studentResult.TotalCount;

            // ---------------------------------------------
            // GET ATTEMPTS FOR THESE STUDENTS
            // ---------------------------------------------

            var studentIds =
                students
                    .Select(s => s.StudentId)
                    .ToList();

            var attempts =
                await _repository
                    .GetAttemptsForAssessmentResultsAsync(
                        assessmentId,
                        studentIds);

            // ---------------------------------------------
            // GROUP ATTEMPTS BY STUDENT
            // ---------------------------------------------

            var attemptsByStudent =
                attempts
                    .GroupBy(a => a.StudentId)
                    .ToDictionary(
                        g => g.Key,
                        g => g
                            .OrderByDescending(a =>
                                a.SubmittedAt
                                ?? a.StartedAt)
                            .ToList());

            // ---------------------------------------------
            // BUILD RESULT
            // ---------------------------------------------

            var results =
                new List<AssessmentStudentResultDto>();

            foreach (var student in students)
            {
                attemptsByStudent.TryGetValue(
                    student.StudentId,
                    out var studentAttempts);

                studentAttempts ??=
                    new List<StudentAssessment>();

                // -----------------------------------------
                // NO ATTEMPT
                // -----------------------------------------

                if (studentAttempts.Count == 0)
                {
                    results.Add(
                        new AssessmentStudentResultDto
                        {
                            StudentId =
                                student.StudentId,

                            StudentName =
                                $"{student.FirstName} {student.LastName}"
                                    .Trim(),

                            Email =
                                student.Email,

                            Phone =
                                student.Phone,

                            AttemptedAt =
                                null,

                            Score =
                                null,

                            Percentage =
                                null,

                            Status =
                                "Unavailable",

                            Result =
                                null,

                            Attempts =
                                0,

                            StudentAssessmentId =
                                null
                        });

                    continue;
                }

                // -----------------------------------------
                // LATEST ATTEMPT
                // -----------------------------------------

                var latestAttempt =
                    studentAttempts.First();

                var status =
                    GetDisplayStatus(
                        latestAttempt);

                var isSubmitted =
                    string.Equals(
                        latestAttempt.Status,
                        "Submitted",
                        StringComparison.OrdinalIgnoreCase);

                results.Add(
                    new AssessmentStudentResultDto
                    {
                        StudentId =
                            student.StudentId,

                        StudentName =
                            $"{student.FirstName} {student.LastName}"
                                .Trim(),

                        Email =
                            student.Email,

                        Phone =
                            student.Phone,

                        AttemptedAt =
                            latestAttempt.SubmittedAt
                            ?? latestAttempt.StartedAt,

                        Score =
                            isSubmitted
                                ? latestAttempt.Score
                                : null,

                        Percentage =
                            isSubmitted
                                ? latestAttempt.Percentage
                                : null,

                        Status =
                            status,

                        Result =
                            isSubmitted
                                ? latestAttempt.Result
                                : null,

                        Attempts =
                            studentAttempts.Count,

                        StudentAssessmentId =
                            latestAttempt.StudentAssessmentId
                    });
            }

            // ---------------------------------------------
            // TOTAL PAGES
            // ---------------------------------------------

            var totalPages =
                totalCount == 0
                    ? 0
                    : (int)Math.Ceiling(
                        totalCount /
                        (double)pageSize);

            // ---------------------------------------------
            // RESPONSE
            // ---------------------------------------------

            return new AssessmentStudentResultsResponseDto
            {
                AssessmentId =
                    assessment.AssessmentId,

                AssessmentTitle =
                    assessment.Title,

                CourseName =
                    assessment.Course?.CourseName
                    ?? string.Empty,

                BatchName =
                    assessment.Batch?.BatchName
                    ?? string.Empty,

                TotalMarks =
                    assessment.TotalMarks,

                PassingMarks =
                    assessment.PassingMarks,

                TotalStudents =
                    totalCount,

                PageNumber =
                    pageNumber,

                PageSize =
                    pageSize,

                TotalPages =
                    totalPages,

                Students =
                    results
            };
        }


        // =========================================================
        // DISPLAY STATUS
        // =========================================================

        private static string GetDisplayStatus(
            StudentAssessment attempt)
        {
            if (string.Equals(
                    attempt.Status,
                    "InProgress",
                    StringComparison.OrdinalIgnoreCase))
            {
                return "In Progress";
            }

            if (string.Equals(
                    attempt.Status,
                    "Submitted",
                    StringComparison.OrdinalIgnoreCase))
            {
                if (string.Equals(
                        attempt.Result,
                        "Pass",
                        StringComparison.OrdinalIgnoreCase))
                {
                    return "Passed";
                }

                if (string.Equals(
                        attempt.Result,
                        "Fail",
                        StringComparison.OrdinalIgnoreCase))
                {
                    return "Failed";
                }

                return "Submitted";
            }

            return "Unavailable";
        }
    }
}