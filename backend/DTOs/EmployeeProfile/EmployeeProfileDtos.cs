using Microsoft.AspNetCore.Http;
namespace TalentSphereAPI.DTOs.EmployeeProfile;

public class UpdatePersonalInfoDto
{
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string? Gender { get; set; }
    public string? MaritalStatus { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? AadhaarNumber { get; set; }
    public string? PanNumber { get; set; }
    public int? DepartmentId { get; set; }
    public string? Designation { get; set; }
    public DateTime? JoiningDate { get; set; }
    public string? BloodGroup { get; set; }
    public string? HouseNumber { get; set; }
    public string? StreetArea { get; set; }
    public string? CityVillage { get; set; }
    public string? District { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? Pincode { get; set; }
}

public class UpdateBankInfoDto
{
    public string? CustomerId { get; set; }
    public string? BankName { get; set; }
    public string? AccountHolderName { get; set; }
    public string? AccountNumber { get; set; }
    public string? IFSCCode { get; set; }
    public string? BranchName { get; set; }
    public string? UANNumber { get; set; }
    public string? PFAccountNumber { get; set; }
    public decimal? AnnualCtc { get; set; }
    public decimal? BasicSalaryMonthly { get; set; }
    public decimal? HraMonthly { get; set; }
    public decimal? ConveyanceAllowanceMonthly { get; set; }
    public decimal? MedicalAllowanceMonthly { get; set; }
    public decimal? SpecialAllowanceMonthly { get; set; }
    public decimal? EmployeePfMonthly { get; set; }
    public decimal? EmployerPfMonthly { get; set; }
    public decimal? ProfessionalTaxMonthly { get; set; }
    public decimal? TdsMonthly { get; set; }
    public decimal? OtherDeductionMonthly { get; set; }
}

public class EducationItemDto
{
    public int? EmployeeEducationId { get; set; }
    public string Qualification { get; set; } = string.Empty;
    public string University { get; set; } = string.Empty;
    public int? Year { get; set; }
    public decimal? Percentage { get; set; }
    public string? Specialization { get; set; }
}

public class SaveEducationDto
{
    public List<EducationItemDto> Educations { get; set; } = new();
}

public class ExperienceItemDto
{
    public int? EmployeeWorkExperienceId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? ReasonForLeaving { get; set; }
    public string? Description { get; set; }
}

public class SaveExperienceDto
{
    public List<ExperienceItemDto> Experiences { get; set; } = new();
}

public class PersonalInfoResponseDto
{
    public int EmployeeId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string? Gender { get; set; }
    public string? MaritalStatus { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? AadhaarNumber { get; set; }
    public string? PanNumber { get; set; }
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public string? Designation { get; set; }
    public DateTime? JoiningDate { get; set; }
    public string? BloodGroup { get; set; }
    public string? HouseNumber { get; set; }
    public string? StreetArea { get; set; }
    public string? CityVillage { get; set; }
    public string? District { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? Pincode { get; set; }
}

public class BankInfoResponseDto
{
    public string? CustomerId { get; set; }
    public string? BankName { get; set; }
    public string? AccountHolderName { get; set; }
    public string? AccountNumber { get; set; }
    public string? IFSCCode { get; set; }
    public string? BranchName { get; set; }
    public string? UANNumber { get; set; }
    public string? PFAccountNumber { get; set; }
    public decimal? AnnualCtc { get; set; }
    public decimal? BasicSalaryMonthly { get; set; }
    public decimal? HraMonthly { get; set; }
    public decimal? ConveyanceAllowanceMonthly { get; set; }
    public decimal? MedicalAllowanceMonthly { get; set; }
    public decimal? SpecialAllowanceMonthly { get; set; }
    public decimal? EmployeePfMonthly { get; set; }
    public decimal? EmployerPfMonthly { get; set; }
    public decimal? ProfessionalTaxMonthly { get; set; }
    public decimal? TdsMonthly { get; set; }
    public decimal? OtherDeductionMonthly { get; set; }
}

public class EducationResponseDto : EducationItemDto { }
public class ExperienceResponseDto : ExperienceItemDto
{
    public decimal? YearsOfExperience { get; set; }
}

public class EmployeeDocumentResponseDto
{
    public int EmployeeDocumentId { get; set; }
    public string Category { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; }
    public string DownloadUrl { get; set; } = string.Empty;
}

public class DocumentProgressItemDto
{
    public string Category { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty;
    public bool Uploaded { get; set; }
    public int? EmployeeDocumentId { get; set; }
}

public class EmployeeProfileResponseDto
{
    public PersonalInfoResponseDto PersonalInfo { get; set; } = new();
    public BankInfoResponseDto BankInfo { get; set; } = new();
    public List<EducationResponseDto> Educations { get; set; } = new();
    public List<ExperienceResponseDto> Experiences { get; set; } = new();
    public List<EmployeeDocumentResponseDto> Documents { get; set; } = new();
    public List<DocumentProgressItemDto> DocumentProgress { get; set; } = new();
}

public class DepartmentOptionDto
{
    public int DepartmentId { get; set; }
    public string Name { get; set; } = string.Empty;
}

// ============================================================
// DOCUMENT UPLOAD
// ============================================================

public class UploadEmployeeDocumentDto
{
    public string DocumentType { get; set; } = string.Empty;

    public IFormFile File { get; set; } = null!;
}