using TalentSphereAPI.Services;

namespace TalentSphereAPI.Providers;

public interface IMeetingProviderFactory
{
    IMeetingAttendanceProvider GetProvider(string meetingProvider);
}