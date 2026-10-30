using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.DTOs.Profile
{
    public class UploadProfilePhotoDto
    {
        [Required]
        public IFormFile Photo { get; set; } = null!;
    }
}