using TalentSphereAPI.Enums;

namespace TalentSphereAPI.DTOs.Invoice

{

    public class InvoiceQueryParameters

    {

        private const int MaxPageSize = 100;

        public int PageNumber { get; set; } = 1;

        private int _pageSize = 10;

        public int PageSize

        {

            get => _pageSize;

            set => _pageSize = value > MaxPageSize ? MaxPageSize : value;

        }

        public string? Search { get; set; }

        public InvoiceStatus? Status { get; set; }

        public int? StudentId { get; set; }

        public int? CourseId { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }

        public string SortBy { get; set; } = "IssueDate";

        public string SortOrder { get; set; } = "desc";

    }

}
