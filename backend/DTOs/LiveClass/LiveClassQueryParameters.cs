namespace TalentSphereAPI.DTOs.LiveClass

{

    public class LiveClassQueryParameters

    {

        public string? Search { get; set; }

        public string? Status { get; set; }

        public DateTime? Date { get; set; }

        public string SortBy { get; set; } = "ScheduledDate";

        public bool Descending { get; set; } = true;

        public int Page { get; set; } = 1;

        public int PageSize { get; set; } = 10;

    }

}
