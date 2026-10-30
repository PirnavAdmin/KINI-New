using TalentSphereAPI.Services;
using TalentSphereAPI.Providers;

public class MeetingProviderFactory : IMeetingProviderFactory
{
    private readonly IEnumerable<IMeetingAttendanceProvider> _providers;

    public MeetingProviderFactory(
        IEnumerable<IMeetingAttendanceProvider> providers)
    {
        _providers = providers;
    }

    public IMeetingAttendanceProvider GetProvider(string meetingProvider)
    {
        var provider = _providers.FirstOrDefault(x =>
            x.ProviderName.Equals(meetingProvider,
                StringComparison.OrdinalIgnoreCase));

        if (provider == null)
            throw new Exception($"Meeting provider '{meetingProvider}' not found.");

        return provider;
    }
}