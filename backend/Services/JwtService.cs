
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(
            int userId,
            string email,
            string role,
            int? organizationId = null,
            int? studentId = null)
        {
            var key =
                _configuration.GetValue<string>("Jwt:Key")
                ?? throw new Exception(
                    "JWT Key not found.");

            var issuer =
                _configuration.GetValue<string>("Jwt:Issuer")
                ?? throw new Exception(
                    "JWT Issuer not found.");

            var audience =
                _configuration.GetValue<string>("Jwt:Audience")
                ?? throw new Exception(
                    "JWT Audience not found.");

            var duration =
                _configuration.GetValue<int>(
                    "Jwt:DurationInMinutes");

            var claims = new List<Claim>
            {
                // ==========================================
                // USER ID
                // ==========================================
                //
                // This remains User.UserId.
                // Employee/Admin/etc. continue using this.
                //
                new Claim(
                    ClaimTypes.NameIdentifier,
                    userId.ToString()),

                // ==========================================
                // EMAIL
                // ==========================================

                new Claim(
                    ClaimTypes.Email,
                    email ?? string.Empty),

                // ==========================================
                // ROLE
                // ==========================================

                new Claim(
                    ClaimTypes.Role,
                    role ?? string.Empty),

                // ==========================================
                // JWT ID
                // ==========================================

                new Claim(
                    JwtRegisteredClaimNames.Jti,
                    Guid.NewGuid().ToString())
            };

            // ==========================================
            // STUDENT ID
            // ==========================================
            //
            // Only added when the logged-in account
            // has a Student profile.
            //
            // Example:
            // UserId    = 15
            // StudentId = 5
            //
            // ==========================================

            if (studentId.HasValue &&
                studentId.Value > 0)
            {
                claims.Add(
                    new Claim(
                        "StudentId",
                        studentId.Value.ToString()));
            }

            // ==========================================
            // ORGANIZATION
            // ==========================================

            if (organizationId.HasValue &&
                organizationId.Value > 0)
            {
                claims.Add(
                    new Claim(
                        "OrganizationId",
                        organizationId.Value.ToString()));
            }

            // ==========================================
            // SECURITY KEY
            // ==========================================

            var securityKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(key));

            var credentials =
                new SigningCredentials(
                    securityKey,
                    SecurityAlgorithms.HmacSha256);

            // ==========================================
            // CREATE TOKEN
            // ==========================================

            var token =
                new JwtSecurityToken(
                    issuer: issuer,
                    audience: audience,
                    claims: claims,
                    expires: DateTime.UtcNow.AddMinutes(
                        duration),
                    signingCredentials: credentials);

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }

        // ==========================================
        // SUPER ADMIN TOKEN
        // ==========================================

        public string GenerateSuperAdminToken(
            SuperAdmin superAdmin)
        {
            return GenerateToken(
                superAdmin.SuperAdminId,
                superAdmin.Email,
                "SuperAdmin",
                null,
                null);
        }
    }
}

