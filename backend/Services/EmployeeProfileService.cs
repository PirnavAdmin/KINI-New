using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.EmployeeProfile;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Models.EmployeeProfile;
using TalentSphereAPI.Repositories;

namespace TalentSphereAPI.Services;

public class EmployeeProfileService : IEmployeeProfileService
{
    private const long MaxFileSize = 3 * 1024 * 1024;
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf", ".jpg", ".jpeg", ".png"
    };

    private static readonly (string Category, string DocumentType)[] RequiredDocuments =
    {
        ("Education Certificates", "10th Certificate"),
        ("Education Certificates", "Intermediate / 12th Certificate"),
        ("Education Certificates", "Degree Certificate"),
        ("Education Certificates", "Post-Graduation Certificate"),
        ("Identity Documents", "Aadhaar Card"),
        ("Identity Documents", "PAN Card"),
        ("Identity Documents", "Passport"),
        ("Identity Documents", "Passport-size Photo"),
        ("Current Company", "Signed Offer Letter"),
        ("Previous Experience / Internship", "Previous - Offer Letter"),
        ("Previous Experience / Internship", "Previous - Appointment Letter"),
        ("Previous Experience / Internship", "Previous - Relieving / Experience Letter"),
        ("Last 3 Months Payslips", "Payslip - Month 1"),
        ("Last 3 Months Payslips", "Payslip - Month 2"),
        ("Last 3 Months Payslips", "Payslip - Month 3")
    };

    private readonly ApplicationDbContext _context;
    private readonly IEmployeeProfileRepository _repository;
    private readonly EmployeeProfileIdentityService _identity;
    private readonly IWebHostEnvironment _environment;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly INotificationService _notificationService;
    public EmployeeProfileService(
        ApplicationDbContext context,
        IEmployeeProfileRepository repository,
        EmployeeProfileIdentityService identity,
        IWebHostEnvironment environment,
        IHttpContextAccessor httpContextAccessor,
INotificationService notificationService)
    {
        _context = context;
        _repository = repository;
        _identity = identity;
        _environment = environment;
        _httpContextAccessor = httpContextAccessor;
        _notificationService = notificationService;
    }

    public async Task<EmployeeProfileResponseDto> GetAsync()
    {
        var employee = await _identity.GetCurrentEmployeeAsync();
        var profile = await _repository.GetOrCreateAsync(employee.OrganizationId, employee);
        return Map(profile, employee);
    }
    public async Task<EmployeeProfileResponseDto> GetByEmployeeIdAsync(int employeeId)
    {
        if (employeeId <= 0)
            throw new ArgumentException("Invalid employee ID.");

        var principal = _httpContextAccessor.HttpContext?.User;

        if (principal?.Identity?.IsAuthenticated != true)
            throw new UnauthorizedAccessException(
                "User is not authenticated.");

        // Get OrganizationId directly from the authenticated JWT.
        var organizationText =
            principal.FindFirst("OrganizationId")?.Value;

        if (!int.TryParse(organizationText, out var organizationId) ||
            organizationId <= 0)
        {
            throw new UnauthorizedAccessException(
                "OrganizationId was not found in the authenticated token.");
        }

        // Find the requested employee only within
        // the authenticated user's organization.
        var employee = await _context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.EmployeeId == employeeId &&
                x.OrganizationId == organizationId &&
                !x.IsDeleted);

        if (employee == null)
        {
            throw new KeyNotFoundException(
                "Employee not found in your organization.");
        }

        // Get the employee profile using organization + employee ID.
        var profile = await _repository.GetAsync(
            organizationId,
            employee.EmployeeId);

        if (profile == null)
        {
            throw new KeyNotFoundException(
                "Employee profile not found.");
        }

        return Map(profile, employee);
    }
    public async Task<PersonalInfoResponseDto> UpdatePersonalAsync(UpdatePersonalInfoDto dto)
    {
        var employee = await _identity.GetCurrentEmployeeAsync();
        var profile = await _repository.GetOrCreateAsync(employee.OrganizationId, employee);

        if (dto.DepartmentId.HasValue)
        {
            var departmentExists = await _context.Departments.AnyAsync(x =>
                x.DepartmentId == dto.DepartmentId.Value &&
                x.OrganizationId == employee.OrganizationId);

            if (!departmentExists)
                throw new InvalidOperationException("Selected department does not belong to your organization.");
        }

        var newEmail = (dto.Email ?? string.Empty).Trim();
        var newPhone = (dto.PhoneNumber ?? string.Empty).Trim();

        if (!string.IsNullOrWhiteSpace(newEmail))
        {
            var duplicateEmail = await _context.Users.AnyAsync(x =>
                x.Email == newEmail &&
                x.UserId != employee.UserId &&
                !x.IsDeleted);

            if (duplicateEmail)
                throw new InvalidOperationException("Email address is already used by another user.");
        }

        if (!string.IsNullOrWhiteSpace(newPhone))
        {
            var duplicatePhone = await _context.Users.AnyAsync(x =>
                x.Phone == newPhone &&
                x.UserId != employee.UserId &&
                !x.IsDeleted);

            if (duplicatePhone)
                throw new InvalidOperationException("Phone number is already used by another user.");
        }

        employee.FirstName = dto.FirstName.Trim();
        employee.LastName = dto.LastName.Trim();
        employee.Phone = newPhone;
        employee.Email = newEmail;

        profile.MiddleName = NullIfEmpty(dto.MiddleName);
        profile.Gender = NullIfEmpty(dto.Gender);
        profile.MaritalStatus = NullIfEmpty(dto.MaritalStatus);
        profile.DateOfBirth = dto.DateOfBirth;
        profile.AadhaarNumber = NullIfEmpty(dto.AadhaarNumber);
        profile.PanNumber = NullIfEmpty(dto.PanNumber);
        profile.DepartmentId = dto.DepartmentId;
        profile.Designation = NullIfEmpty(dto.Designation);
        profile.JoiningDate = dto.JoiningDate;
        profile.BloodGroup = NullIfEmpty(dto.BloodGroup);
        profile.HouseNumber = NullIfEmpty(dto.HouseNumber);
        profile.StreetArea = NullIfEmpty(dto.StreetArea);
        profile.CityVillage = NullIfEmpty(dto.CityVillage);
        profile.District = NullIfEmpty(dto.District);
        profile.State = NullIfEmpty(dto.State);
        profile.Country = NullIfEmpty(dto.Country);
        profile.Pincode = NullIfEmpty(dto.Pincode);

        if (string.IsNullOrWhiteSpace(profile.EmployeeCode))
            profile.EmployeeCode = $"P{employee.EmployeeId}";

        // Keep the linked login user in sync with editable name/email/phone.
        if (employee.UserId.HasValue)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x =>
                x.UserId == employee.UserId.Value &&
                x.OrganizationId == employee.OrganizationId &&
                !x.IsDeleted);

            if (user != null)
            {
                user.FirstName = employee.FirstName;
                user.LastName = employee.LastName;
                user.Email = employee.Email;
                user.Phone = employee.Phone;
            }
        }

        await _repository.SaveAsync(profile);
        try
        {
            await _notificationService.CreateOrganizationNotificationAsync(
                employee.OrganizationId,
                "Employee Profile Updated",
                $"{employee.FirstName} {employee.LastName}'s employee profile has been updated.",
                NotificationType.EmployeeProfileUpdated,
                employee.EmployeeId,
                ReferenceType.Employee);
        }
        catch
        {
            // Profile update is already saved.
            // Notification failure must not undo the profile update.
        }
        return MapPersonal(profile, employee);
    }

    public async Task<BankInfoResponseDto> UpdateBankAsync(UpdateBankInfoDto dto)
    {
        var employee = await _identity.GetCurrentEmployeeAsync();
        var profile = await _repository.GetOrCreateAsync(employee.OrganizationId, employee);

        profile.CustomerId = NullIfEmpty(dto.CustomerId);
        profile.BankName = NullIfEmpty(dto.BankName);
        profile.AccountHolderName = NullIfEmpty(dto.AccountHolderName);
        profile.AccountNumber = NullIfEmpty(dto.AccountNumber);
        profile.IFSCCode = NullIfEmpty(dto.IFSCCode);
        profile.BranchName = NullIfEmpty(dto.BranchName);
        profile.UANNumber = NullIfEmpty(dto.UANNumber);
        profile.PFAccountNumber = NullIfEmpty(dto.PFAccountNumber);
        profile.AnnualCtc = NonNegative(dto.AnnualCtc, nameof(dto.AnnualCtc));
        profile.BasicSalaryMonthly = NonNegative(dto.BasicSalaryMonthly, nameof(dto.BasicSalaryMonthly));
        profile.HraMonthly = NonNegative(dto.HraMonthly, nameof(dto.HraMonthly));
        profile.ConveyanceAllowanceMonthly = NonNegative(dto.ConveyanceAllowanceMonthly, nameof(dto.ConveyanceAllowanceMonthly));
        profile.MedicalAllowanceMonthly = NonNegative(dto.MedicalAllowanceMonthly, nameof(dto.MedicalAllowanceMonthly));
        profile.SpecialAllowanceMonthly = NonNegative(dto.SpecialAllowanceMonthly, nameof(dto.SpecialAllowanceMonthly));
        profile.EmployeePfMonthly = NonNegative(dto.EmployeePfMonthly, nameof(dto.EmployeePfMonthly));
        profile.EmployerPfMonthly = NonNegative(dto.EmployerPfMonthly, nameof(dto.EmployerPfMonthly));
        profile.ProfessionalTaxMonthly = NonNegative(dto.ProfessionalTaxMonthly, nameof(dto.ProfessionalTaxMonthly));
        profile.TdsMonthly = NonNegative(dto.TdsMonthly, nameof(dto.TdsMonthly));
        profile.OtherDeductionMonthly = NonNegative(dto.OtherDeductionMonthly, nameof(dto.OtherDeductionMonthly));

        await _repository.SaveAsync(profile);
        return MapBank(profile);
    }

    public async Task<List<EducationResponseDto>> SaveEducationAsync(SaveEducationDto dto)
    {
        var employee = await _identity.GetCurrentEmployeeAsync();
        var profile = await _repository.GetOrCreateAsync(employee.OrganizationId, employee);

        var existing = await _context.EmployeeEducations
            .Where(x => x.EmployeeProfileId == profile.EmployeeProfileId &&
                        x.OrganizationId == employee.OrganizationId &&
                        !x.IsDeleted)
            .ToListAsync();

        foreach (var item in existing)
            item.IsDeleted = true;

        foreach (var item in dto.Educations ?? new List<EducationItemDto>())
        {
            if (string.IsNullOrWhiteSpace(item.Qualification) &&
                string.IsNullOrWhiteSpace(item.University) &&
                !item.Year.HasValue &&
                !item.Percentage.HasValue &&
                string.IsNullOrWhiteSpace(item.Specialization))
                continue;

            if (item.Percentage is < 0 or > 100)
                throw new InvalidOperationException("Education percentage must be between 0 and 100.");

            _context.EmployeeEducations.Add(new EmployeeEducation
            {
                OrganizationId = employee.OrganizationId,
                EmployeeProfileId = profile.EmployeeProfileId,
                Qualification = item.Qualification.Trim(),
                University = item.University.Trim(),
                Year = item.Year,
                Percentage = item.Percentage,
                Specialization = NullIfEmpty(item.Specialization)
            });
        }

        await _repository.SaveAsync(profile);

        return await _context.EmployeeEducations
            .AsNoTracking()
            .Where(x => x.EmployeeProfileId == profile.EmployeeProfileId && !x.IsDeleted)
            .OrderBy(x => x.EmployeeEducationId)
            .Select(x => new EducationResponseDto
            {
                EmployeeEducationId = x.EmployeeEducationId,
                Qualification = x.Qualification,
                University = x.University,
                Year = x.Year,
                Percentage = x.Percentage,
                Specialization = x.Specialization
            })
            .ToListAsync();
    }

    public async Task<List<ExperienceResponseDto>> SaveExperienceAsync(SaveExperienceDto dto)
    {
        var employee = await _identity.GetCurrentEmployeeAsync();
        var profile = await _repository.GetOrCreateAsync(employee.OrganizationId, employee);

        var existing = await _context.EmployeeWorkExperiences
            .Where(x => x.EmployeeProfileId == profile.EmployeeProfileId &&
                        x.OrganizationId == employee.OrganizationId &&
                        !x.IsDeleted)
            .ToListAsync();

        foreach (var item in existing)
            item.IsDeleted = true;

        foreach (var item in dto.Experiences ?? new List<ExperienceItemDto>())
        {
            if (string.IsNullOrWhiteSpace(item.CompanyName) &&
                string.IsNullOrWhiteSpace(item.Designation) &&
                !item.FromDate.HasValue &&
                !item.ToDate.HasValue &&
                string.IsNullOrWhiteSpace(item.ReasonForLeaving) &&
                string.IsNullOrWhiteSpace(item.Description))
                continue;

            if (item.FromDate.HasValue && item.ToDate.HasValue && item.ToDate < item.FromDate)
                throw new InvalidOperationException("To Date cannot be earlier than From Date.");

            var end = item.ToDate ?? DateTime.UtcNow;
            var years = item.FromDate.HasValue
                ? Math.Round((decimal)((end - item.FromDate.Value).TotalDays / 365.2425), 2)
                : 0m;

            _context.EmployeeWorkExperiences.Add(new EmployeeWorkExperience
            {
                OrganizationId = employee.OrganizationId,
                EmployeeProfileId = profile.EmployeeProfileId,
                CompanyName = item.CompanyName.Trim(),
                Designation = item.Designation.Trim(),
                FromDate = item.FromDate,
                ToDate = item.ToDate,
                YearsOfExperience = years,
                ReasonForLeaving = NullIfEmpty(item.ReasonForLeaving),
                Description = NullIfEmpty(item.Description)
            });
        }

        await _repository.SaveAsync(profile);

        return await _context.EmployeeWorkExperiences
            .AsNoTracking()
            .Where(x => x.EmployeeProfileId == profile.EmployeeProfileId && !x.IsDeleted)
            .OrderBy(x => x.EmployeeWorkExperienceId)
            .Select(x => new ExperienceResponseDto
            {
                EmployeeWorkExperienceId = x.EmployeeWorkExperienceId,
                CompanyName = x.CompanyName,
                Designation = x.Designation,
                FromDate = x.FromDate,
                ToDate = x.ToDate,
                YearsOfExperience = x.YearsOfExperience,
                ReasonForLeaving = x.ReasonForLeaving,
                Description = x.Description
            })
            .ToListAsync();
    }

    public async Task<EmployeeDocumentResponseDto> UploadDocumentAsync(string documentType, IFormFile file)
    {
        var employee = await _identity.GetCurrentEmployeeAsync();
        var profile = await _repository.GetOrCreateAsync(employee.OrganizationId, employee);

        if (file == null || file.Length <= 0)
            throw new InvalidOperationException("Please select a document to upload.");

        if (file.Length > MaxFileSize)
            throw new InvalidOperationException("Maximum document size is 3 MB.");

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(extension))
            throw new InvalidOperationException("Only PDF, JPG, JPEG and PNG files are allowed.");

        var required = RequiredDocuments.FirstOrDefault(x =>
            string.Equals(x.DocumentType, documentType?.Trim(), StringComparison.OrdinalIgnoreCase));

        if (string.IsNullOrWhiteSpace(required.DocumentType))
            throw new InvalidOperationException("Invalid document type.");

        // One current file per document type. A re-upload replaces the old record/file.
        var old = await _context.EmployeeDocuments.FirstOrDefaultAsync(x =>
            x.EmployeeProfileId == profile.EmployeeProfileId &&
            x.OrganizationId == employee.OrganizationId &&
            x.DocumentType == required.DocumentType &&
            !x.IsDeleted);

        if (old != null)
        {
            old.IsDeleted = true;
            old.DeletedOn = DateTime.UtcNow;
            old.DeletedBy = "EmployeeProfile";
            DeletePhysicalFile(old.StoredFilePath);
        }

        var webRoot = _environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
            webRoot = Path.Combine(_environment.ContentRootPath, "wwwroot");

        var folder = Path.Combine(webRoot, "employee-documents", employee.OrganizationId.ToString(), employee.EmployeeId.ToString());
        Directory.CreateDirectory(folder);

        var storedFileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        var physicalPath = Path.Combine(folder, storedFileName);

        await using (var stream = new FileStream(physicalPath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
        {
            await file.CopyToAsync(stream);
        }

        var document = new EmployeeDocument
        {
            OrganizationId = employee.OrganizationId,
            EmployeeProfileId = profile.EmployeeProfileId,
            Category = required.Category,
            DocumentType = required.DocumentType,
            OriginalFileName = Path.GetFileName(file.FileName),
            StoredFileName = storedFileName,
            StoredFilePath = physicalPath,
            ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
            FileSize = file.Length,
            UploadedAt = DateTime.UtcNow
        };

        _context.EmployeeDocuments.Add(document);
        await _context.SaveChangesAsync();

        // =====================================================
        // ORGANIZATION NOTIFICATION - DOCUMENT UPLOADED
        // =====================================================

        try
        {
            await _notificationService
                .CreateOrganizationNotificationAsync(
                    employee.OrganizationId,
                    "Employee Document Uploaded",
                    $"{employee.FirstName} {employee.LastName} uploaded " +
                    $"the document '{document.DocumentType}'.",
                    NotificationType.DocumentUploaded,
                    document.EmployeeDocumentId,
                    ReferenceType.Document);
        }
        catch
        {
            // Document upload is already completed.
            // Notification failure must not undo the upload.
        }
        

        return MapDocument(document);
    }
    public async Task<bool> DeleteDocumentAsync(int documentId)
    {
        var employee = await _identity.GetCurrentEmployeeAsync();

        var document = await _context.EmployeeDocuments.FirstOrDefaultAsync(x =>
            x.EmployeeDocumentId == documentId &&
            x.OrganizationId == employee.OrganizationId &&
            x.EmployeeProfile.EmployeeId == employee.EmployeeId &&
            !x.IsDeleted);

        if (document == null)
            return false;

        document.IsDeleted = true;
        document.DeletedOn = DateTime.UtcNow;
        document.DeletedBy = "EmployeeProfile";

        var documentType = document.DocumentType;

        DeletePhysicalFile(document.StoredFilePath);

        await _context.SaveChangesAsync();

        // =====================================================
        // ORGANIZATION NOTIFICATION - DOCUMENT DELETED
        // =====================================================

        try
        {
            await _notificationService
                .CreateOrganizationNotificationAsync(
                    employee.OrganizationId,
                    "Employee Document Deleted",
                    $"{employee.FirstName} {employee.LastName} deleted " +
                    $"the document '{documentType}'.",
                    NotificationType.DocumentDeleted,
                    documentId,
                    ReferenceType.Document);
        }
         catch
        {
            // Document deletion is already completed.
            // Notification failure must not undo the deletion.
        }

        return true;
    }
    public async Task<(byte[] Bytes, string ContentType, string FileName)> DownloadDocumentAsync(int documentId)
    {
        var employee = await _identity.GetCurrentEmployeeAsync();

        var document = await _context.EmployeeDocuments
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.EmployeeDocumentId == documentId &&
                x.OrganizationId == employee.OrganizationId &&
                x.EmployeeProfile.EmployeeId == employee.EmployeeId &&
                !x.IsDeleted);

        if (document == null)
            throw new KeyNotFoundException("Document not found.");

        if (!File.Exists(document.StoredFilePath))
            throw new FileNotFoundException("The stored document file could not be found.");

        return (await File.ReadAllBytesAsync(document.StoredFilePath), document.ContentType, document.OriginalFileName);
    }

    public async Task<List<DepartmentOptionDto>> GetDepartmentsAsync()
    {
        var employee = await _identity.GetCurrentEmployeeAsync();

        return await _context.Departments
            .AsNoTracking()
            .Where(x => x.OrganizationId == employee.OrganizationId)
            .OrderBy(x => x.Name)
            .Select(x => new DepartmentOptionDto
            {
                DepartmentId = x.DepartmentId,
                Name = x.Name
            })
            .ToListAsync();
    }

    public async Task<byte[]> GeneratePdfAsync()
    {
        var profile = await GetAsync();
        QuestPDF.Settings.License = LicenseType.Community;

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(9));

                page.Header().Column(column =>
                {
                    column.Item().AlignCenter().Text("EMPLOYEE PROFILE").Bold().FontSize(18);
                    column.Item().AlignCenter().Text($"Employee ID: {profile.PersonalInfo.EmployeeCode}").FontSize(10);
                });

                page.Content().Column(column =>
                {
                    Section(column, "Personal Information", new[]
                    {
                        Pair("Name", JoinName(profile.PersonalInfo.FirstName, profile.PersonalInfo.MiddleName, profile.PersonalInfo.LastName)),
                        Pair("Gender", profile.PersonalInfo.Gender),
                        Pair("Marital Status", profile.PersonalInfo.MaritalStatus),
                        Pair("Date of Birth", FormatDate(profile.PersonalInfo.DateOfBirth)),
                        Pair("Phone", profile.PersonalInfo.PhoneNumber),
                        Pair("Email", profile.PersonalInfo.Email),
                        Pair("Aadhaar", profile.PersonalInfo.AadhaarNumber),
                        Pair("PAN", profile.PersonalInfo.PanNumber),
                        Pair("Department", profile.PersonalInfo.DepartmentName),
                        Pair("Designation", profile.PersonalInfo.Designation),
                        Pair("Date of Joining", FormatDate(profile.PersonalInfo.JoiningDate)),
                        Pair("Blood Group", profile.PersonalInfo.BloodGroup),
                        Pair("Address", JoinAddress(profile.PersonalInfo))
                    });

                    Section(column, "Bank & Salary", new[]
                    {
                        Pair("Customer ID", profile.BankInfo.CustomerId),
                        Pair("Bank", profile.BankInfo.BankName),
                        Pair("Account Holder", profile.BankInfo.AccountHolderName),
                        Pair("Account Number", profile.BankInfo.AccountNumber),
                        Pair("IFSC", profile.BankInfo.IFSCCode),
                        Pair("Branch", profile.BankInfo.BranchName),
                        Pair("UAN", profile.BankInfo.UANNumber),
                        Pair("PF Account", profile.BankInfo.PFAccountNumber),
                        Pair("Annual CTC", FormatMoney(profile.BankInfo.AnnualCtc)),
                        Pair("Basic", FormatMoney(profile.BankInfo.BasicSalaryMonthly)),
                        Pair("HRA", FormatMoney(profile.BankInfo.HraMonthly)),
                        Pair("Conveyance", FormatMoney(profile.BankInfo.ConveyanceAllowanceMonthly)),
                        Pair("Medical", FormatMoney(profile.BankInfo.MedicalAllowanceMonthly)),
                        Pair("Special", FormatMoney(profile.BankInfo.SpecialAllowanceMonthly)),
                        Pair("Employee PF", FormatMoney(profile.BankInfo.EmployeePfMonthly)),
                        Pair("Employer PF", FormatMoney(profile.BankInfo.EmployerPfMonthly)),
                        Pair("Professional Tax", FormatMoney(profile.BankInfo.ProfessionalTaxMonthly)),
                        Pair("TDS", FormatMoney(profile.BankInfo.TdsMonthly)),
                        Pair("Other Deduction", FormatMoney(profile.BankInfo.OtherDeductionMonthly))
                    });

                    column.Item().PageBreak();
                    column.Item().Text("Education").Bold().FontSize(13);
                    foreach (var education in profile.Educations)
                    {
                        column.Item().PaddingTop(5).Border(1).Padding(6).Column(c =>
                        {
                            c.Item().Text($"{education.Qualification} - {education.University}").Bold();
                            c.Item().Text($"Year: {education.Year?.ToString() ?? "-"}   Percentage: {education.Percentage?.ToString("0.##") ?? "-"}   Specialization: {education.Specialization ?? "-"}");
                        });
                    }

                    column.Item().PaddingTop(12).Text("Previous Work Experience").Bold().FontSize(13);
                    foreach (var experience in profile.Experiences)
                    {
                        column.Item().PaddingTop(5).Border(1).Padding(6).Column(c =>
                        {
                            c.Item().Text($"{experience.CompanyName} - {experience.Designation}").Bold();
                            c.Item().Text($"{FormatDate(experience.FromDate)} to {FormatDate(experience.ToDate)}   Experience: {experience.YearsOfExperience?.ToString("0.##") ?? "0"} years");
                            c.Item().Text($"Reason: {experience.ReasonForLeaving ?? "-"}");
                            c.Item().Text(experience.Description ?? "");
                        });
                    }

                    column.Item().PaddingTop(12).Text("Documents").Bold().FontSize(13);
                    foreach (var document in profile.Documents)
                        column.Item().Text($"{document.Category}: {document.DocumentType} - {document.OriginalFileName}");
                });

                page.Footer().AlignCenter().Text("Generated from TalentSphere employee profile");
            });
        }).GeneratePdf();
    }

    private EmployeeProfileResponseDto Map(EmployeeProfile profile, Employee employee)
    {
        return new EmployeeProfileResponseDto
        {
            PersonalInfo = MapPersonal(profile, employee),
            BankInfo = MapBank(profile),
            Educations = profile.Educations.Where(x => !x.IsDeleted).OrderBy(x => x.EmployeeEducationId).Select(x => new EducationResponseDto
            {
                EmployeeEducationId = x.EmployeeEducationId,
                Qualification = x.Qualification,
                University = x.University,
                Year = x.Year,
                Percentage = x.Percentage,
                Specialization = x.Specialization
            }).ToList(),
            Experiences = profile.Experiences.Where(x => !x.IsDeleted).OrderBy(x => x.EmployeeWorkExperienceId).Select(x => new ExperienceResponseDto
            {
                EmployeeWorkExperienceId = x.EmployeeWorkExperienceId,
                CompanyName = x.CompanyName,
                Designation = x.Designation,
                FromDate = x.FromDate,
                ToDate = x.ToDate,
                YearsOfExperience = x.YearsOfExperience,
                ReasonForLeaving = x.ReasonForLeaving,
                Description = x.Description
            }).ToList(),
            Documents = profile.Documents.Where(x => !x.IsDeleted).OrderByDescending(x => x.UploadedAt).Select(MapDocument).ToList(),
            DocumentProgress = BuildProgress(profile.Documents)
        };
    }

    private PersonalInfoResponseDto MapPersonal(EmployeeProfile profile, Employee employee)
    {
        return new PersonalInfoResponseDto
        {
            EmployeeId = employee.EmployeeId,
            EmployeeCode = string.IsNullOrWhiteSpace(profile.EmployeeCode) ? $"P{employee.EmployeeId}" : profile.EmployeeCode,
            FirstName = employee.FirstName,
            MiddleName = profile.MiddleName,
            LastName = employee.LastName,
            Gender = profile.Gender,
            MaritalStatus = profile.MaritalStatus,
            DateOfBirth = profile.DateOfBirth,
            PhoneNumber = employee.Phone,
            Email = employee.Email,
            AadhaarNumber = profile.AadhaarNumber,
            PanNumber = profile.PanNumber,
            DepartmentId = profile.DepartmentId,
            DepartmentName = profile.Department?.Name,
            Designation = profile.Designation,
            JoiningDate = profile.JoiningDate,
            BloodGroup = profile.BloodGroup,
            HouseNumber = profile.HouseNumber,
            StreetArea = profile.StreetArea,
            CityVillage = profile.CityVillage,
            District = profile.District,
            State = profile.State,
            Country = profile.Country,
            Pincode = profile.Pincode
        };
    }

    private static BankInfoResponseDto MapBank(EmployeeProfile profile) => new()
    {
        CustomerId = profile.CustomerId,
        BankName = profile.BankName,
        AccountHolderName = profile.AccountHolderName,
        AccountNumber = profile.AccountNumber,
        IFSCCode = profile.IFSCCode,
        BranchName = profile.BranchName,
        UANNumber = profile.UANNumber,
        PFAccountNumber = profile.PFAccountNumber,
        AnnualCtc = profile.AnnualCtc,
        BasicSalaryMonthly = profile.BasicSalaryMonthly,
        HraMonthly = profile.HraMonthly,
        ConveyanceAllowanceMonthly = profile.ConveyanceAllowanceMonthly,
        MedicalAllowanceMonthly = profile.MedicalAllowanceMonthly,
        SpecialAllowanceMonthly = profile.SpecialAllowanceMonthly,
        EmployeePfMonthly = profile.EmployeePfMonthly,
        EmployerPfMonthly = profile.EmployerPfMonthly,
        ProfessionalTaxMonthly = profile.ProfessionalTaxMonthly,
        TdsMonthly = profile.TdsMonthly,
        OtherDeductionMonthly = profile.OtherDeductionMonthly
    };

    private EmployeeDocumentResponseDto MapDocument(EmployeeDocument document) => new()
    {
        EmployeeDocumentId = document.EmployeeDocumentId,
        Category = document.Category,
        DocumentType = document.DocumentType,
        OriginalFileName = document.OriginalFileName,
        ContentType = document.ContentType,
        FileSize = document.FileSize,
        UploadedAt = document.UploadedAt,
        DownloadUrl = $"{GetBaseUrl()}/api/v1/employee-profile/documents/{document.EmployeeDocumentId}/download"
    };

    private List<DocumentProgressItemDto> BuildProgress(IEnumerable<EmployeeDocument> documents)
    {
        var active = documents.Where(x => !x.IsDeleted).ToList();
        return RequiredDocuments.Select(required =>
        {
            var match = active.FirstOrDefault(x =>
                string.Equals(x.DocumentType, required.DocumentType, StringComparison.OrdinalIgnoreCase));

            return new DocumentProgressItemDto
            {
                Category = required.Category,
                DocumentType = required.DocumentType,
                Uploaded = match != null,
                EmployeeDocumentId = match?.EmployeeDocumentId
            };
        }).ToList();
    }

    private string GetBaseUrl()
    {
        var request = _httpContextAccessor.HttpContext?.Request;
        if (request == null)
            return string.Empty;
        return $"{request.Scheme}://{request.Host}";
    }

    private static decimal? NonNegative(decimal? value, string fieldName)
    {
        if (value < 0)
            throw new InvalidOperationException($"{fieldName} cannot be negative.");
        return value;
    }

    private static string? NullIfEmpty(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string JoinName(string first, string? middle, string last) =>
        string.Join(" ", new[] { first, middle, last }.Where(x => !string.IsNullOrWhiteSpace(x)));

    private static string JoinAddress(PersonalInfoResponseDto p) =>
        string.Join(", ", new[] { p.HouseNumber, p.StreetArea, p.CityVillage, p.District, p.State, p.Country, p.Pincode }
            .Where(x => !string.IsNullOrWhiteSpace(x)));

    private static string FormatDate(DateTime? date) => date?.ToString("dd/MM/yyyy") ?? "-";
    private static string FormatMoney(decimal? amount) => amount.HasValue ? amount.Value.ToString("0.00") : "-";
    private static (string Label, string? Value) Pair(string label, string? value) => (label, value);

    private static void Section(ColumnDescriptor column, string title, IEnumerable<(string Label, string? Value)> rows)
    {
        column.Item().PaddingTop(10).Text(title).Bold().FontSize(13);
        foreach (var row in rows)
        {
            column.Item().PaddingTop(2).Row(r =>
            {
                r.ConstantItem(110).Text(row.Label).Bold();
                r.RelativeItem().Text(row.Value ?? "-");
            });
        }
    }

    private static void DeletePhysicalFile(string? path)
    {
        try
        {
            if (!string.IsNullOrWhiteSpace(path) && File.Exists(path))
                File.Delete(path);
        }
        catch
        {
            // Database state remains authoritative; physical cleanup can be retried later.
        }
    }
}

