using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Services
{
    public sealed class OrganizationLogoException : Exception
    {
        public OrganizationLogoException(int statusCode, string message) : base(message) => StatusCode = statusCode;
        public int StatusCode { get; }
    }

    public interface IOrganizationLogoService
    {
        /// <summary>Current logo URL of the caller's organization, or null.</summary>
        Task<(int OrganizationId, string? LogoUrl)> GetAsync(CancellationToken ct = default);

        /// <summary>Saves the logo, replacing any existing one. Returns the new URL and whether one was replaced.</summary>
        Task<(string LogoUrl, bool Replaced)> SaveAsync(IFormFile? file, CancellationToken ct = default);

        /// <summary>Removes the logo. Returns false when there was none.</summary>
        Task<bool> RemoveAsync(CancellationToken ct = default);
    }

    /// <summary>
    /// Organization logos are public brand images: stored under
    /// wwwroot/uploads/organization-logos (same convention as profile photos and
    /// course posters) and referenced on Organizations.LogoUrl as a URL path.
    /// The organization always comes from the signed-in user's token.
    /// </summary>
    public class OrganizationLogoService : IOrganizationLogoService
    {
        public const long MaxBytes = 2 * 1024 * 1024;
        private const string UrlPrefix = "/uploads/organization-logos/";

        private readonly ApplicationDbContext _context;
        private readonly ITenantContext _tenant;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<OrganizationLogoService> _logger;

        public OrganizationLogoService(
            ApplicationDbContext context,
            ITenantContext tenant,
            IWebHostEnvironment environment,
            ILogger<OrganizationLogoService> logger)
        {
            _context = context;
            _tenant = tenant;
            _environment = environment;
            _logger = logger;
        }

        private string Folder => Path.Combine(
            _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot"),
            "uploads", "organization-logos");

        public async Task<(int OrganizationId, string? LogoUrl)> GetAsync(CancellationToken ct = default)
        {
            var organizationId = _tenant.OrganizationId;
            var logo = await _context.Organizations
                .AsNoTracking()
                .Where(o => o.OrganizationId == organizationId)
                .Select(o => new { o.OrganizationId, o.LogoUrl })
                .FirstOrDefaultAsync(ct)
                ?? throw new OrganizationLogoException(404, "Organization not found.");
            return (logo.OrganizationId, logo.LogoUrl);
        }

        public async Task<(string LogoUrl, bool Replaced)> SaveAsync(IFormFile? file, CancellationToken ct = default)
        {
            var organization = await FindOrganizationAsync(ct);

            if (file == null || file.Length == 0)
                throw new OrganizationLogoException(400, "Please choose a logo image.");
            if (file.Length > MaxBytes)
                throw new OrganizationLogoException(400, "Logo must be 2 MB or smaller.");

            byte[] bytes;
            await using (var input = file.OpenReadStream())
            using (var buffer = new MemoryStream((int)file.Length))
            {
                await input.CopyToAsync(buffer, ct);
                bytes = buffer.ToArray();
            }

            // Real content decides the type. SVG is refused: it can carry script.
            var type = PrivateFileStorage.DetectImageType(bytes)
                ?? throw new OrganizationLogoException(400, "Only PNG, JPG, JPEG or WebP images are allowed.");

            Directory.CreateDirectory(Folder);
            var fileName = $"{organization.OrganizationId}_{Guid.NewGuid():N}{type.Extension}";
            await File.WriteAllBytesAsync(Path.Combine(Folder, fileName), bytes, ct);

            var oldUrl = organization.LogoUrl;
            organization.LogoUrl = UrlPrefix + fileName;
            try
            {
                await _context.SaveChangesAsync(ct);
            }
            catch
            {
                TryDelete(UrlPrefix + fileName);   // no orphan file when the record was not updated
                throw;
            }

            // Only after the new reference is saved.
            var replaced = !string.IsNullOrWhiteSpace(oldUrl);
            if (replaced && oldUrl != organization.LogoUrl)
                TryDelete(oldUrl);

            return (organization.LogoUrl, replaced);
        }

        public async Task<bool> RemoveAsync(CancellationToken ct = default)
        {
            var organization = await FindOrganizationAsync(ct);
            if (string.IsNullOrWhiteSpace(organization.LogoUrl))
                return false;

            var oldUrl = organization.LogoUrl;
            organization.LogoUrl = null;
            await _context.SaveChangesAsync(ct);
            TryDelete(oldUrl);
            return true;
        }

        private async Task<Models.Organization> FindOrganizationAsync(CancellationToken ct)
        {
            var organizationId = _tenant.OrganizationId;
            return await _context.Organizations.FirstOrDefaultAsync(o => o.OrganizationId == organizationId, ct)
                ?? throw new OrganizationLogoException(404, "Organization not found.");
        }

        // Deletes a logo file only if the URL points inside the logos folder.
        private void TryDelete(string? url)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(url) || !url.StartsWith(UrlPrefix, StringComparison.Ordinal))
                    return;
                var name = Path.GetFileName(url);
                if (string.IsNullOrEmpty(name) || name != url[UrlPrefix.Length..])
                    return;
                var path = Path.Combine(Folder, name);
                if (File.Exists(path))
                    File.Delete(path);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not delete old organization logo {Url}", url);
            }
        }
    }
}
