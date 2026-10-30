namespace TalentSphereAPI.DTOs.Goals

{

    public class UpdateGoalDto

    {

        public string Title { get; set; } = string.Empty;

        public int OwnerId { get; set; }

        public string Quarter { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

    }

}
