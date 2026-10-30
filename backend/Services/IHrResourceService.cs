using Microsoft.AspNetCore.Http;
using TalentSphereAPI.DTOs.HR;

namespace TalentSphereAPI.Services;

public interface IHrResourceService
{
    Task<HrResourceSummaryDto> GetSummaryAsync();

    Task<HrResourcePagedResponse> GetResourcesAsync(
        HrResourceFilterDto filter);

    Task<HrResourceDetailDto?> GetByIdAsync(
        int resourceId);

    Task<HrResourceDetailDto> UploadAsync(
        IFormFile file,
        string name,
        string category,
        string? description);

    Task<HrResourceDetailDto?> UpdateAsync(
        int resourceId,
        HrResourceUpdateDto dto);

    Task<bool> DeleteAsync(
        int resourceId);

    Task<(byte[] Content, string ContentType, string FileName)?> DownloadAsync(
        int resourceId);

    Task<(byte[] Content, string ContentType, string FileName)?> PreviewAsync(
        int resourceId);

    Task<HrResourceStringListDto> GetCategoriesAsync();

    Task<HrResourceStringListDto> GetFileTypesAsync();

    Task<HrResourceUploaderListDto> GetUploadersAsync();

    Task<byte[]> ExportAsync(
        HrResourceFilterDto filter);
}