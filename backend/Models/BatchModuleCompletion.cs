
using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.Models
{
    public class BatchModuleCompletion
    {
        [Key]
        public int BatchModuleCompletionId { get; set; }

        [Required]
        public int BatchId { get; set; }

        [Required]
        public int CourseId { get; set; }

        [Required]
        public int ModuleId { get; set; }

        // null means completion has not been verified.
        public bool? IsCompleted { get; set; }

        public DateTime? CompletedAtUtc { get; set; }

        public int? CompletedByMentorId { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }

        public DateTime UpdatedAtUtc { get; set; }
            = DateTime.UtcNow;
    }
}
