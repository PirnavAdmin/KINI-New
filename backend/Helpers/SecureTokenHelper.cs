using System.Security.Cryptography;
using System.Text;

namespace TalentSphereAPI.Helpers
{
    /// <summary>
    /// Opaque bearer tokens for public flows (enrollment access, password setup).
    /// Only the SHA-256 hash is ever persisted.
    /// </summary>
    public static class SecureTokenHelper
    {
        /// <summary>256-bit random token, base64url without padding (43 chars).</summary>
        public static string GenerateToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(32);
            return Convert.ToBase64String(bytes)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }

        /// <summary>Lower-case hex SHA-256 (64 chars).</summary>
        public static string Hash(string token)
        {
            var hash = SHA256.HashData(Encoding.UTF8.GetBytes(token ?? string.Empty));
            return Convert.ToHexString(hash).ToLowerInvariant();
        }

        /// <summary>Constant-time comparison of a raw token against a stored hash.</summary>
        public static bool Matches(string? token, string? storedHash)
        {
            if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(storedHash))
                return false;

            var candidate = Encoding.ASCII.GetBytes(Hash(token.Trim()));
            var expected = Encoding.ASCII.GetBytes(storedHash);

            return candidate.Length == expected.Length &&
                   CryptographicOperations.FixedTimeEquals(candidate, expected);
        }

        /// <summary>Random upper-case code from an unambiguous alphabet.</summary>
        public static string RandomCode(int length)
        {
            const string alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            var chars = new char[length];
            for (var i = 0; i < length; i++)
                chars[i] = alphabet[RandomNumberGenerator.GetInt32(alphabet.Length)];
            return new string(chars);
        }
    }
}
