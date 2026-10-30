using System.ComponentModel.DataAnnotations;

using System.ComponentModel.DataAnnotations.Schema;

using TalentSphereAPI.Models;

namespace TalentSphereAPI.Models

{

    public class LiveClassAttendance

    {

        [Key]

        public int AttendanceId { get; set; }

        public int LiveClassId { get; set; }

        [ForeignKey(nameof(LiveClassId))]

        public LiveClass LiveClass { get; set; } = null!;

        public int StudentId { get; set; }

        public Student Student { get; set; } = null!;

        public DateTime JoinedAt { get; set; }

        public DateTime? LeftAt { get; set; }

        public bool IsPresent { get; set; }

        public int DurationInMinutes { get; set; }

    }

}
