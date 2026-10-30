using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public class StudentAssessment
    {
        [Key]
        public int StudentAssessmentId { get; set; }

        public int AssessmentId { get; set; }

        public int StudentId { get; set; }

        public DateTime StartedAt { get; set; }

        public DateTime? SubmittedAt { get; set; }

        public decimal Score { get; set; }

        public decimal Percentage { get; set; }

        public string Result { get; set; } = "Pending";
        // Pending | Pass | Fail

        public string Status { get; set; } = "NotStarted";
        // NotStarted | InProgress | Submitted

        public Assessment Assessment { get; set; } = null!;

        public Student Student { get; set; } = null!;

        public ICollection<StudentAssessmentAnswer> Answers { get; set; }
            = new List<StudentAssessmentAnswer>();
    }
}