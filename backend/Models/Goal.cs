namespace TalentSphereAPI.Models

{

    public class Goal

    {

        public int GoalId { get; set; }

        public string Title { get; set; } = string.Empty;

        public int OwnerId { get; set; }

        public string Quarter { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public Employee? Owner { get; set; }

    }

}
