namespace TalentSphereAPI.Models

{

    public class Competency

    {

        public int CompetencyId { get; set; }

        public string CompetencyName { get; set; } = string.Empty;

        public string? Description { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    }

}
