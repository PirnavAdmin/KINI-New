using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TalentSphereAPI.Models
{
    public class Attendance : BaseEntity
    {
        [Key]
        public int AttendanceId { get; set; }

        public int StudentId { get; set; }
        public Student Student { get; set; } = null!;

        public decimal AttendancePercentage { get; set; }
        public int LiveClassId { get; set; }
        public LiveClass LiveClass { get; set; } = null!;

        public DateTime? FirstJoinTime { get; set; }

        public DateTime? LastLeaveTime { get; set; }

        public int TotalDurationMinutes { get; set; }

        public AttendanceStatus Status { get; set; }

        public bool IsLate { get; set; }

        public bool LeftEarly { get; set; }

        public bool IsAutoMarked { get; set; }

        public bool IsSynced { get; set; }

        public DateTime? LastSyncedAt { get; set; }

        public ICollection<AttendanceSession> Sessions { get; set; }
            = new List<AttendanceSession>();
    }
}