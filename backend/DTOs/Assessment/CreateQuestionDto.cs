using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.DTOs.AssessmentQuestion
{
    public class CreateQuestionDto
    {
        [Required]
        public int AssessmentId { get; set; }

        [Required]
        public string QuestionText { get; set; } = string.Empty;

        public string QuestionType { get; set; } = "MCQ";

        public string Difficulty { get; set; } = "Easy";

        public int Marks { get; set; }

        public string? CorrectAnswer { get; set; }

        public int OrderNo { get; set; }

        public List<CreateOptionDto> Options { get; set; } = new();
    }
}