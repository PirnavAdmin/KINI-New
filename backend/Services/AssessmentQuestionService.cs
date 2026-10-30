using TalentSphereAPI.DTOs.AssessmentQuestion;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories.Interfaces;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services
{
    public class AssessmentQuestionService
        : IAssessmentQuestionService
    {
        private readonly IAssessmentQuestionRepository _repository;
        private readonly IAssessmentRepository _assessmentRepository;

        public AssessmentQuestionService(
            IAssessmentQuestionRepository repository,
            IAssessmentRepository assessmentRepository)
        {
            _repository = repository;
            _assessmentRepository = assessmentRepository;
        }

        // =====================================================
        // GET BY ASSESSMENT
        // =====================================================

        public async Task<List<QuestionDto>>
            GetByAssessmentAsync(
                int assessmentId)
        {
            var questions =
                await _repository
                    .GetByAssessmentAsync(
                        assessmentId);

            return questions
                .Select(q => new QuestionDto
                {
                    QuestionId =
                        q.QuestionId,

                    QuestionText =
                        q.QuestionText,

                    QuestionType =
                        q.QuestionType,

                    Difficulty =
                        q.Difficulty,

                    Marks =
                        q.Marks,

                    OrderNo =
                        q.OrderNo,

                    Options =
                        q.Options
                            .Select(o => new OptionDto
                            {
                                OptionId =
                                    o.OptionId,

                                OptionText =
                                    o.OptionText,

                                IsCorrect =
                                    o.IsCorrect
                            })
                            .ToList()
                })
                .ToList();
        }

        // =====================================================
        // GET BY ID
        // =====================================================

        public async Task<QuestionDto?>
            GetByIdAsync(
                int questionId)
        {
            var q =
                await _repository
                    .GetByIdAsync(
                        questionId);

            if (q == null)
                return null;

            return new QuestionDto
            {
                QuestionId =
                    q.QuestionId,

                QuestionText =
                    q.QuestionText,

                QuestionType =
                    q.QuestionType,

                Difficulty =
                    q.Difficulty,

                Marks =
                    q.Marks,

                OrderNo =
                    q.OrderNo,

                Options =
                    q.Options
                        .Select(o => new OptionDto
                        {
                            OptionId =
                                o.OptionId,

                            OptionText =
                                o.OptionText,

                            IsCorrect =
                                o.IsCorrect
                        })
                        .ToList()
            };
        }

        // =====================================================
        // CREATE
        // =====================================================

        public async Task<int> CreateAsync(
            CreateQuestionDto dto)
        {
            await ValidateQuestion(dto);

            var question =
                new AssessmentQuestion
                {
                    AssessmentId =
                        dto.AssessmentId,

                    QuestionText =
                        dto.QuestionText.Trim(),

                    QuestionType =
                        dto.QuestionType.Trim(),

                    Difficulty =
                        dto.Difficulty.Trim(),

                    Marks =
                        dto.Marks,

                    CorrectAnswer =
                        dto.CorrectAnswer,

                    OrderNo =
                        dto.OrderNo,

                    Options =
                        dto.Options
                            .Select(o =>
                                new AssessmentOption
                                {
                                    OptionText =
                                        o.OptionText.Trim(),

                                    IsCorrect =
                                        o.IsCorrect
                                })
                            .ToList()
                };

            await _repository
                .AddAsync(question);

            await _repository
                .SaveChangesAsync();

            return question.QuestionId;
        }

        // =====================================================
        // UPDATE
        // =====================================================

        public async Task<bool> UpdateAsync(
            int questionId,
            UpdateQuestionDto dto)
        {
            var question =
                await _repository
                    .GetByIdAsync(
                        questionId);

            if (question == null)
                return false;

            await ValidateQuestion(
                dto,
                question.AssessmentId);

            question.QuestionText =
                dto.QuestionText.Trim();

            question.QuestionType =
                dto.QuestionType.Trim();

            question.Difficulty =
                dto.Difficulty.Trim();

            question.Marks =
                dto.Marks;

            question.CorrectAnswer =
                dto.CorrectAnswer;

            question.OrderNo =
                dto.OrderNo;

            question.Options.Clear();

            foreach (var option in dto.Options)
            {
                question.Options.Add(
                    new AssessmentOption
                    {
                        OptionText =
                            option.OptionText.Trim(),

                        IsCorrect =
                            option.IsCorrect
                    });
            }

            await _repository
                .UpdateAsync(
                    question);

            await _repository
                .SaveChangesAsync();

            return true;
        }

        // =====================================================
        // DELETE
        // =====================================================

        public async Task<bool> DeleteAsync(
            int questionId)
        {
            var question =
                await _repository
                    .GetByIdAsync(
                        questionId);

            if (question == null)
                return false;

            await _repository
                .DeleteAsync(
                    question);

            await _repository
                .SaveChangesAsync();

            return true;
        }

        // =====================================================
        // VALIDATE QUESTION
        // =====================================================

        private async Task ValidateQuestion(
            CreateQuestionDto dto,
            int? existingAssessmentId = null)
        {
            var assessment =
                await _assessmentRepository
                    .GetByIdAsync(
                        dto.AssessmentId);

            if (assessment == null)
            {
                throw new ArgumentException(
                    "Assessment does not exist.");
            }

            if (assessment.Status != "Draft")
            {
                throw new InvalidOperationException(
                    "Questions can only be added or edited while the assessment is in Draft status.");
            }

            if (string.IsNullOrWhiteSpace(
                    dto.QuestionText))
            {
                throw new ArgumentException(
                    "Question text is required.");
            }

            if (dto.Marks <= 0)
            {
                throw new ArgumentException(
                    "Question marks must be greater than zero.");
            }

            if (dto.OrderNo <= 0)
            {
                throw new ArgumentException(
                    "Question order must be greater than zero.");
            }

            var type =
                dto.QuestionType.Trim();

            if (!type.Equals(
                    "MCQ",
                    StringComparison.OrdinalIgnoreCase) &&
                !type.Equals(
                    "TrueFalse",
                    StringComparison.OrdinalIgnoreCase) &&
                !type.Equals(
                    "Descriptive",
                    StringComparison.OrdinalIgnoreCase) &&
                !type.Equals(
                    "Coding",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new ArgumentException(
                    "Question type must be MCQ, TrueFalse, Descriptive, or Coding.");
            }

            // -----------------------------------------------
            // MCQ validation
            // -----------------------------------------------

            if (type.Equals(
                    "MCQ",
                    StringComparison.OrdinalIgnoreCase))
            {
                if (dto.Options == null ||
                    dto.Options.Count < 2)
                {
                    throw new ArgumentException(
                        "MCQ questions require at least two options.");
                }

                if (dto.Options.Any(o =>
                        string.IsNullOrWhiteSpace(
                            o.OptionText)))
                {
                    throw new ArgumentException(
                        "All options must contain text.");
                }

                var correctCount =
                    dto.Options.Count(
                        o => o.IsCorrect);

                if (correctCount != 1)
                {
                    throw new ArgumentException(
                        "MCQ questions must have exactly one correct option.");
                }
            }

            // -----------------------------------------------
            // True/False validation
            // -----------------------------------------------

            if (type.Equals(
                    "TrueFalse",
                    StringComparison.OrdinalIgnoreCase))
            {
                if (dto.Options == null ||
                    dto.Options.Count != 2)
                {
                    throw new ArgumentException(
                        "TrueFalse questions must contain exactly two options.");
                }

                var correctCount =
                    dto.Options.Count(
                        o => o.IsCorrect);

                if (correctCount != 1)
                {
                    throw new ArgumentException(
                        "TrueFalse questions must have exactly one correct option.");
                }
            }
        }
    }
}