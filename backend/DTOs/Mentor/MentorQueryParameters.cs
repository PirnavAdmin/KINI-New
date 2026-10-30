namespace TalentSphereAPI.DTOs.Mentor

{

    public class MentorQueryParameters

    {

        public string? Search { get; set; }

        public bool? Status { get; set; }

        public string SortBy { get; set; } = "MentorId";

        public bool IsDescending { get; set; }

        public int PageNumber { get; set; } = 1;

        public int PageSize { get; set; } = 10;

    }

}
