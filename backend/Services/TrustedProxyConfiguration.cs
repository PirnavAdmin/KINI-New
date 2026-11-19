using System.Net;
using Microsoft.AspNetCore.HttpOverrides;

namespace TalentSphereAPI.Services
{
    /// <summary>
    /// Opt-in X-Forwarded-For / X-Forwarded-Proto support for deployments
    /// behind nginx/ngrok, so per-client rate limits see the real client IP.
    ///
    /// Configure trusted proxy networks, e.g. for the docker-compose network:
    ///   ForwardedHeaders__KnownNetworks__0=172.16.0.0/12
    /// Without configuration nothing changes (headers are ignored).
    /// </summary>
    public static class TrustedProxyConfiguration
    {
        public static bool AddTrustedProxies(this IServiceCollection services, IConfiguration configuration)
        {
            var networks = configuration.GetSection("ForwardedHeaders:KnownNetworks").Get<string[]>() ?? Array.Empty<string>();
            var proxies = configuration.GetSection("ForwardedHeaders:KnownProxies").Get<string[]>() ?? Array.Empty<string>();

            if (networks.Length == 0 && proxies.Length == 0)
                return false;

            services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
                options.ForwardLimit = 1;
                options.KnownNetworks.Clear();
                options.KnownProxies.Clear();

                foreach (var cidr in networks.Where(n => !string.IsNullOrWhiteSpace(n)))
                {
                    var parts = cidr.Trim().Split('/');
                    if (parts.Length != 2 || !IPAddress.TryParse(parts[0], out var prefix) || !int.TryParse(parts[1], out var length))
                        throw new InvalidOperationException($"Invalid ForwardedHeaders:KnownNetworks entry '{cidr}'. Use CIDR, e.g. 172.16.0.0/12.");
                    options.KnownNetworks.Add(new Microsoft.AspNetCore.HttpOverrides.IPNetwork(prefix, length));
                }

                foreach (var proxy in proxies.Where(p => !string.IsNullOrWhiteSpace(p)))
                {
                    if (!IPAddress.TryParse(proxy.Trim(), out var address))
                        throw new InvalidOperationException($"Invalid ForwardedHeaders:KnownProxies entry '{proxy}'.");
                    options.KnownProxies.Add(address);
                }
            });

            return true;
        }
    }
}
