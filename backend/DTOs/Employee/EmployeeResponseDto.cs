namespace TalentSphereAPI.DTOs.Employee
{
    public class EmployeeResponseDto
    {
        public int EmployeeId { get; set; }

        // UserId used by Permission API
        public int? UserId { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public string EmployeeType { get; set; } = string.Empty;

        // HR fields
        public int? DepartmentId { get; set; }

        public string? Department { get; set; }

        public string? Designation { get; set; }

        public DateTime? JoiningDate { get; set; }

        public string? ProfilePhotoUrl { get; set; }
    }
}