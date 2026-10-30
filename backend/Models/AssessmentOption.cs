using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public class AssessmentOption
    {
        [Key]
        public int OptionId { get; set; }

        [Required]
        public int QuestionId { get; set; }

        [Required]
        [MaxLength(500)]
        public string OptionText { get; set; } = string.Empty;

        public bool IsCorrect { get; set; }

        public AssessmentQuestion Question { get; set; } = null!;
    }
}