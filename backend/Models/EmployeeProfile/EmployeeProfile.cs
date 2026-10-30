using TalentSphereAPI.Models;

namespace TalentSphereAPI.Models.EmployeeProfile;

public class EmployeeProfile : BaseEntity
{
    public int EmployeeProfileId { get; set; }
    public int OrganizationId { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;

    // Personal information
    public string? MiddleName { get; set; }
    public string? Gender { get; set; }
    public string? MaritalStatus { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? AadhaarNumber { get; set; }
    public string? PanNumber { get; set; }
    public string? BloodGroup { get; set; }

    // Address
    public string? HouseNumber { get; set; }
    public string? StreetArea { get; set; }
    public string? CityVillage { get; set; }
    public string? District { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? Pincode { get; set; }

    // Employment
    public int? DepartmentId { get; set; }
    public string? Designation { get; set; }
    public DateTime? JoiningDate { get; set; }

    // Bank
    public string? CustomerId { get; set; }
    public string? BankName { get; set; }
    public string? AccountHolderName { get; set; }
    public string? AccountNumber { get; set; }
    public string? IFSCCode { get; set; }
    public string? BranchName { get; set; }
    public string? UANNumber { get; set; }
    public string? PFAccountNumber { get; set; }

    // Salary structure
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

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;

    public Organization Organization { get; set; } = null!;
    public Employee Employee { get; set; } = null!;
    public Department? Department { get; set; }
    public ICollection<EmployeeEducation> Educations { get; set; } = new List<EmployeeEducation>();
    public ICollection<EmployeeWorkExperience> Experiences { get; set; } = new List<EmployeeWorkExperience>();
    public ICollection<EmployeeDocument> Documents { get; set; } = new List<EmployeeDocument>();
}
