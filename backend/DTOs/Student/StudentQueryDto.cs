namespace TalentSphereAPI.DTOs.Student

{

    public class StudentQueryDto

    {

        public string? Search { get; set; }

        public string? Status { get; set; }

        public string? SortBy { get; set; }

        public bool Descending { get; set; } = false;

        public int PageNumber { get; set; } = 1;

        public int PageSize { get; set; } = 10;

    }

}
