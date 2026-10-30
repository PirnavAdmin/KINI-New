namespace TalentSphereAPI.DTOs.HR;

public class HrStudentSummaryDto
{
    public int TotalStudents { get; set; }
    public int ActiveStudents { get; set; }
    public int InactiveStudents { get; set; }
    public int PendingStudents { get; set; }
}

public class HrStudentDto
{
    public int StudentId { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? ProfilePhotoUrl { get; set; }

    public int CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;

    public int BatchId { get; set; }
    public string BatchName { get; set; } = string.Empty;

    public int? MentorId { get; set; }
    public string MentorName { get; set; } = string.Empty;

    public string? MentorProfilePhotoUrl { get; set; }

    public string Status { get; set; } = string.Empty;

    public decimal Attendance { get; set; }

    public int AssessmentsCleared { get; set; }

    public string CourseDates { get; set; } = string.Empty;
}

public class HrStudentQueryDto
{
    public string? Search { get; set; }

    public string? Status { get; set; }

    public int? CourseId { get; set; }

    public int? BatchId { get; set; }

    public int? MentorId { get; set; }

    public string? SortBy { get; set; }

    public bool Descending { get; set; }

    public int PageNumber { get; set; } = 1;

    public int PageSize { get; set; } = 10;
}

public class HrStudentUpdateDto
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public int CourseId { get; set; }

    public int BatchId { get; set; }

    public int? MentorId { get; set; }
}

public class HrStudentStatusUpdateDto
{
    public string Status { get; set; } = string.Empty;
}

public class HrStudentEnrollmentDto
{
    public int StudentId { get; set; }

    public int CourseId { get; set; }

    public string CourseName { get; set; } = string.Empty;

    public int BatchId { get; set; }

    public string BatchName { get; set; } = string.Empty;

    public int? MentorId { get; set; }

    public string MentorName { get; set; } = string.Empty;

    public string? ProfilePhotoUrl { get; set; }

    public string? MentorProfilePhotoUrl { get; set; }

    public string Status { get; set; } = string.Empty;

    public string CourseDates { get; set; } = string.Empty;
}