namespace TalentSphereAPI.DTOs
{
    public class ProfileResponseDto
    {
        public int UserId { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        // Organization / Tenant
        public int? OrganizationId { get; set; }

        // Employee linked to this User
        public int? EmployeeId { get; set; }

        // Mentor linked to this Employee
        public int? MentorId { get; set; }

        public string? ProfilePhotoUrl { get; set; }

        public string Role { get; set; } = string.Empty;
    }
}