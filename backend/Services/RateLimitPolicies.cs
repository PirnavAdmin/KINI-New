using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace TalentSphereAPI.Services
{
    /// <summary>Per-client-IP rate limits for the anonymous enrollment endpoints.</summary>
    public static class RateLimitPolicies
    {
        public const string PublicEnrollmentWrite = "public-enrollment-write";
        public const string PublicEnrollmentRead = "public-enrollment-read";

        public static IServiceCollection AddPublicEnrollmentRateLimits(this IServiceCollection services)
        {
            return services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

                options.OnRejected = async (context, ct) =>
                {
                    if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                        context.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString();

                    await context.HttpContext.Response.WriteAsJsonAsync(new
                    {
                        success = false,
                        code = "RATE_LIMITED",
                        message = "Too many requests. Please wait a few minutes and try again."
                    }, ct);
                };

                // Create enrollment, submit payment, resend link: 20 per 15 minutes per IP.
                options.AddPolicy(PublicEnrollmentWrite, http =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        ClientKey(http),
                        _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 20,
                            Window = TimeSpan.FromMinutes(15),
                            QueueLimit = 0
                        }));

                // Status polling + payment page: 120 per minute per IP.
                options.AddPolicy(PublicEnrollmentRead, http =>
                    RateLimitPartition.GetSlidingWindowLimiter(
                        ClientKey(http),
                        _ => new SlidingWindowRateLimiterOptions
                        {
                            PermitLimit = 120,
                            Window = TimeSpan.FromMinutes(1),
                            SegmentsPerWindow = 6,
                            QueueLimit = 0
                        }));
            });
        }

        // RemoteIpAddress only (X-Forwarded-For is spoofable unless a trusted
        // proxy is configured with UseForwardedHeaders).
        private static string ClientKey(HttpContext http) =>
            http.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}
