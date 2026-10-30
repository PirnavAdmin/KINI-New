using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public class AssessmentQuestion
    {
        [Key]
        public int QuestionId { get; set; }

        [Required]
        public int AssessmentId { get; set; }

        [Required]
        public string QuestionText { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string QuestionType { get; set; } = "MCQ";
        // MCQ | TrueFalse | Descriptive | Coding

        public int Marks { get; set; }

        [MaxLength(20)]
        public string Difficulty { get; set; } = "Easy";

        public string? CorrectAnswer { get; set; }

        public int OrderNo { get; set; }

        public Assessment Assessment { get; set; } = null!;

        public ICollection<AssessmentOption> Options { get; set; }
            = new List<AssessmentOption>();
    }
}