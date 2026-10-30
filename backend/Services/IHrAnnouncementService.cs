using TalentSphereAPI.DTOs.HR;

namespace TalentSphereAPI.Services;

public interface IHrAnnouncementService
{
    Task<HrAnnouncementSummaryDto> GetSummaryAsync();

    Task<HrAnnouncementPagedResponse> GetAnnouncementsAsync(
        HrAnnouncementFilterDto filter);

    Task<HrAnnouncementDetailDto?> GetByIdAsync(
        int announcementId);

    Task<HrAnnouncementDetailDto> CreateAsync(
        HrAnnouncementCreateDto dto);

    Task<HrAnnouncementDetailDto?> UpdateAsync(
        int announcementId,
        HrAnnouncementUpdateDto dto);

    Task<bool> DeleteAsync(
        int announcementId);

    Task<HrAnnouncementOptionsDto> GetOptionsAsync();

    Task<byte[]> ExportAsync(
        HrAnnouncementFilterDto filter);
}