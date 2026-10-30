using System.Text.Json;
using TalentSphereAPI.DTOs.AI;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories;
using TalentSphereAPI.Repositories.Interfaces;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services
{
    public class AssessmentAiService : IAssessmentAiService
    {
        private readonly IOpenRouterService _openRouterService;
        private readonly IAssessmentRepository _assessmentRepository;

        public AssessmentAiService(
            IOpenRouterService openRouterService,
            IAssessmentRepository assessmentRepository)
        {
            _openRouterService = openRouterService;
            _assessmentRepository = assessmentRepository;
        }

        public async Task<Assessment> GenerateQuestionsAsync(GenerateAssessmentDto dto)

        {  var assessment = new Assessment
            {
                Title = dto.Title,
                Description = dto.Description,
                CourseId = dto.CourseId,
                BatchId = dto.BatchId,
                TotalMarks = dto.TotalMarks,
                PassingMarks = dto.PassingMarks,
                DurationMinutes = dto.DurationMinutes,
                AssessmentType = dto.AssessmentType,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate
            };

        await _assessmentRepository.AddAsync(assessment);
        await _assessmentRepository.SaveChangesAsync();
      
            var prompt = $@"
Generate {dto.QuestionCount} {dto.QuestionType} questions.

Topic:
{dto.Topic}

Difficulty:
{dto.Difficulty}

Return ONLY valid JSON.

Schema:

{{
  ""questions"": [
    {{
      ""questionText"": ""string"",
      ""difficulty"": ""string"",
      ""marks"": 2,
      ""explanation"": ""string"",
      ""options"": [
        {{
          ""optionText"": ""string"",
          ""isCorrect"": true
        }}
      ]
    }}
  ]
}}

Rules:

- Exactly 4 options
- Exactly 1 correct option
- No markdown
- No explanation outside JSON
- Return only JSON.
";

            var aiResponse = await _openRouterService.GetChatResponseAsync(prompt);
            if (aiResponse.StartsWith("Sorry,", StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception(aiResponse);
            }

            Console.WriteLine("========== AI RAW RESPONSE ==========");
            Console.WriteLine(aiResponse);
            Console.WriteLine("====================================");

            aiResponse = aiResponse
                .Replace("```json", "")
                .Replace("```", "")
                .Trim();

            AiAssessmentResponseDto? result;

            try
            {
                result = JsonSerializer.Deserialize<AiAssessmentResponseDto>(
                    aiResponse,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
            }
            catch (Exception ex)
            {
                throw new Exception(
                    $"AI returned invalid JSON.\n\nRaw Response:\n{aiResponse}\n\nParser Error:\n{ex.Message}");
            }
            if (result == null || result.Questions.Count == 0)
            {
                throw new Exception("No questions generated.");
            }

            var questions = result.Questions.Select(q =>
                new AssessmentQuestion
                {
                    AssessmentId = assessment.AssessmentId,
                    QuestionText = q.QuestionText,
                    Difficulty = q.Difficulty,
                    Marks = q.Marks,
                    QuestionType = dto.QuestionType,
                    CorrectAnswer = q.Options
                        .FirstOrDefault(x => x.IsCorrect)?
                        .OptionText,
                    Options = q.Options.Select(o =>
                        new AssessmentOption
                        {
                            OptionText = o.OptionText,
                            IsCorrect = o.IsCorrect
                        }).ToList()
                }).ToList();

            await _assessmentRepository.AddQuestionsAsync(questions);

            await _assessmentRepository.SaveChangesAsync();

             return assessment;
            
        }
    }
}