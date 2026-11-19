using System.Security.Cryptography;

namespace TalentSphereAPI.Services
{
    public sealed record StoredImage(
        string StoragePath,
        string ContentType,
        long SizeBytes,
        string Sha256);

    public interface IPrivateFileStorage
    {
        /// <summary>
        /// Validates (size + file signature) and saves an image under
        /// App_Data/{category}/{organizationId}/. Returns null with an error
        /// message when the file is not an accepted image.
        /// </summary>
        Task<(StoredImage? Image, string? Error)> SaveImageAsync(
            IFormFile file,
            string category,
            int organizationId,
            long maxBytes,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Like SaveImageAsync but for supporting documents: PDF, JPG or PNG,
        /// checked by file signature (not by the browser's content type).
        /// </summary>
        Task<(StoredImage? File, string? Error)> SaveDocumentAsync(
            IFormFile file,
            string category,
            int organizationId,
            long maxBytes,
            CancellationToken cancellationToken = default);

        /// <summary>Opens a stored file, or null when the key is invalid/missing.</summary>
        FileStream? OpenRead(string storagePath);

        void TryDelete(string? storagePath);
    }

    /// <summary>
    /// Stores uploads under ContentRoot/App_Data, which is NOT served by
    /// UseStaticFiles (that only serves wwwroot). Files are only reachable
    /// through authorized endpoints.
    /// </summary>
    public class PrivateFileStorage : IPrivateFileStorage
    {
        private readonly string _root;
        private readonly ILogger<PrivateFileStorage> _logger;

        private static readonly (string ContentType, string Extension, byte[] Signature, int Offset)[] ImageSignatures =
        {
            ("image/jpeg", ".jpg", new byte[] { 0xFF, 0xD8, 0xFF }, 0),
            ("image/png", ".png", new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }, 0),
            // WebP: "RIFF" .... "WEBP"
            ("image/webp", ".webp", "WEBP"u8.ToArray(), 8),
        };

        public PrivateFileStorage(
            IWebHostEnvironment environment,
            ILogger<PrivateFileStorage> logger)
        {
            _root = Path.GetFullPath(Path.Combine(environment.ContentRootPath, "App_Data"));
            _logger = logger;
        }

        public async Task<(StoredImage? Image, string? Error)> SaveImageAsync(
            IFormFile file,
            string category,
            int organizationId,
            long maxBytes,
            CancellationToken cancellationToken = default)
        {
            if (file == null || file.Length == 0)
                return (null, "Please upload the payment screenshot.");

            if (file.Length > maxBytes)
                return (null, $"The image must be {maxBytes / (1024 * 1024)} MB or smaller.");

            await using var input = file.OpenReadStream();
            using var buffer = new MemoryStream((int)file.Length);
            await input.CopyToAsync(buffer, cancellationToken);
            var bytes = buffer.ToArray();

            var match = DetectImage(bytes);
            if (match == null)
                return (null, "Only JPG, PNG or WebP images are allowed.");

            var directory = Path.Combine(_root, SafeSegment(category), organizationId.ToString());
            Directory.CreateDirectory(directory);

            var fileName = $"{Guid.NewGuid():N}{match.Value.Extension}";
            var fullPath = Path.Combine(directory, fileName);
            await File.WriteAllBytesAsync(fullPath, bytes, cancellationToken);

            var relative = Path.GetRelativePath(_root, fullPath).Replace('\\', '/');
            var sha = Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant();

            return (new StoredImage(relative, match.Value.ContentType, bytes.LongLength, sha), null);
        }

        private static readonly (string ContentType, string Extension, byte[] Signature)[] DocumentSignatures =
        {
            ("application/pdf", ".pdf", "%PDF-"u8.ToArray()),
            ("image/jpeg", ".jpg", new byte[] { 0xFF, 0xD8, 0xFF }),
            ("image/png", ".png", new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }),
        };

        public async Task<(StoredImage? File, string? Error)> SaveDocumentAsync(
            IFormFile file,
            string category,
            int organizationId,
            long maxBytes,
            CancellationToken cancellationToken = default)
        {
            if (file == null || file.Length == 0)
                return (null, "Please choose a file to upload.");

            if (file.Length > maxBytes)
                return (null, $"The file must be {maxBytes / (1024 * 1024)} MB or smaller.");

            await using var input = file.OpenReadStream();
            using var buffer = new MemoryStream((int)file.Length);
            await input.CopyToAsync(buffer, cancellationToken);
            var bytes = buffer.ToArray();

            (string ContentType, string Extension)? match = null;
            foreach (var (contentType, extension, signature) in DocumentSignatures)
            {
                if (bytes.Length >= signature.Length && bytes.AsSpan(0, signature.Length).SequenceEqual(signature))
                {
                    match = (contentType, extension);
                    break;
                }
            }

            if (match == null)
                return (null, "Only PDF, JPG, JPEG or PNG files are allowed.");

            var directory = Path.Combine(_root, SafeSegment(category), organizationId.ToString());
            Directory.CreateDirectory(directory);

            var fullPath = Path.Combine(directory, $"{Guid.NewGuid():N}{match.Value.Extension}");
            await File.WriteAllBytesAsync(fullPath, bytes, cancellationToken);

            var relative = Path.GetRelativePath(_root, fullPath).Replace('\\', '/');
            var sha = Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant();

            return (new StoredImage(relative, match.Value.ContentType, bytes.LongLength, sha), null);
        }

        public FileStream? OpenRead(string storagePath)
        {
            var fullPath = Resolve(storagePath);
            if (fullPath == null || !File.Exists(fullPath))
                return null;

            return new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        }

        public void TryDelete(string? storagePath)
        {
            try
            {
                var fullPath = Resolve(storagePath);
                if (fullPath != null && File.Exists(fullPath))
                    File.Delete(fullPath);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not delete private file {Path}", storagePath);
            }
        }

        // Rejects any key that escapes App_Data (path traversal).
        private string? Resolve(string? storagePath)
        {
            if (string.IsNullOrWhiteSpace(storagePath))
                return null;

            var fullPath = Path.GetFullPath(Path.Combine(_root, storagePath));
            return fullPath.StartsWith(_root + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)
                ? fullPath
                : null;
        }

        /// <summary>JPEG, PNG or WebP detected from the file bytes (not the name or browser type).</summary>
        public static (string ContentType, string Extension)? DetectImageType(byte[] bytes) => DetectImage(bytes);

        private static (string ContentType, string Extension)? DetectImage(byte[] bytes)
        {
            foreach (var (contentType, extension, signature, offset) in ImageSignatures)
            {
                if (bytes.Length < offset + signature.Length)
                    continue;

                if (!bytes.AsSpan(offset, signature.Length).SequenceEqual(signature))
                    continue;

                if (contentType == "image/webp" && !bytes.AsSpan(0, 4).SequenceEqual("RIFF"u8))
                    continue;

                return (contentType, extension);
            }

            return null;
        }

        private static string SafeSegment(string value) =>
            string.Concat(value.Where(char.IsLetterOrDigit));
    }
}
