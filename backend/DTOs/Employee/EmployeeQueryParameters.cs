namespace TalentSphereAPI.DTOs.Employee
{
    public class EmployeeQueryParameters
    {
        public string? Search { get; set; }

        public int? DepartmentId { get; set; }

        public string? Role { get; set; }

        public string? Status { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public int Page { get; set; } = 1;

        public int Limit
        {
            get => _limit;
            set => _limit = value > 100 ? 100 : value < 1 ? 10 : value;
        }

        private int _limit = 10;

        public string? SortBy { get; set; } = "employeeId";

        public string? SortOrder { get; set; } = "desc";

        // ---------------------------------------------------------
        // Backward compatibility with the existing API
        // ---------------------------------------------------------

        public int PageNumber
        {
            get => Page;
            set => Page = value < 1 ? 1 : value;
        }

        public int PageSize
        {
            get => Limit;
            set => Limit = value;
        }

        public bool IsDescending =>
            string.Equals(
                SortOrder,
                "desc",
                StringComparison.OrdinalIgnoreCase);
    }
}