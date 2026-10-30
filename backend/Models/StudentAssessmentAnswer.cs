using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public class StudentAssessmentAnswer
    {
        [Key]
        public int AnswerId { get; set; }

        public int StudentAssessmentId { get; set; }

        public int QuestionId { get; set; }

        public int? SelectedOptionId { get; set; }

        public string? AnswerText { get; set; }

        public bool IsCorrect { get; set; }

        public decimal MarksAwarded { get; set; }

        public StudentAssessment StudentAssessment { get; set; } = null!;

        public AssessmentQuestion Question { get; set; } = null!;
    }
}