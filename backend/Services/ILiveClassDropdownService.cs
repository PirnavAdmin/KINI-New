using TalentSphereAPI.DTOs.DropDown;

namespace TalentSphereAPI.Services

{

    public interface ILiveClassDropdownService

    {

        Task<IEnumerable<DropdownDto>> GetCoursesAsync();

        Task<IEnumerable<DropdownDto>> GetBatchesAsync();

        Task<IEnumerable<DropdownDto>> GetMentorsAsync();

        Task<IEnumerable<MeetingPlatformDto>> GetMeetingPlatformsAsync();

        Task<IEnumerable<LiveClassStatusDto>> GetStatusesAsync();

    }

}
