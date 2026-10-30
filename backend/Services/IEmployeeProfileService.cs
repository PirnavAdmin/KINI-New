using TalentSphereAPI.DTOs.EmployeeProfile;

namespace TalentSphereAPI.Services;

public interface IEmployeeProfileService
{
    Task<EmployeeProfileResponseDto> GetAsync();
    Task<PersonalInfoResponseDto> UpdatePersonalAsync(UpdatePersonalInfoDto dto);
    Task<BankInfoResponseDto> UpdateBankAsync(UpdateBankInfoDto dto);
    Task<List<EducationResponseDto>> SaveEducationAsync(SaveEducationDto dto);
    Task<List<ExperienceResponseDto>> SaveExperienceAsync(SaveExperienceDto dto);
    Task<EmployeeDocumentResponseDto> UploadDocumentAsync(string documentType, IFormFile file);
    Task<bool> DeleteDocumentAsync(int documentId);
    Task<(byte[] Bytes, string ContentType, string FileName)> DownloadDocumentAsync(int documentId);
    Task<List<DepartmentOptionDto>> GetDepartmentsAsync();
    Task<byte[]> GeneratePdfAsync();

    Task<EmployeeProfileResponseDto> GetByEmployeeIdAsync(int employeeId);
}

