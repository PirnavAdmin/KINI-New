using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    /// <summary>
    /// Logo of the signed-in user's organization (never an id from the request).
    /// multipart/form-data, field "file": PNG, JPG, JPEG or WebP, max 2 MB.
    /// The returned logoUrl is a public path such as /uploads/organization-logos/1_abc.png.
    /// </summary>
    [ApiController]
    [Route("api/v1/organization/logo")]
    public class OrganizationLogoController : ControllerBase
    {
        private readonly IOrganizationLogoService _logos;

        public OrganizationLogoController(IOrganizationLogoService logos)
        {
            _logos = logos;
        }

        // GET /api/v1/organization/logo  — any signed-in user of the organization
        [HttpGet]
        [Authorize]
        public Task<IActionResult> Get() =>
            Run(async () =>
            {
                var (organizationId, logoUrl) = await _logos.GetAsync(HttpContext.RequestAborted);
                return Ok(new
                {
                    success = true,
                    message = logoUrl == null ? "This organization has no logo." : "Organization logo retrieved successfully.",
                    data = new { organizationId, logoUrl }
                });
            });

        // POST /api/v1/organization/logo  — upload (also replaces an existing logo)
        [HttpPost]
        [Authorize(Roles = "OrganizationAdmin,Organization")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(OrganizationLogoService.MaxBytes + 64 * 1024)]
        public Task<IActionResult> Upload(IFormFile? file) =>
            Run(async () =>
            {
                var (logoUrl, replaced) = await _logos.SaveAsync(file, HttpContext.RequestAborted);
                var body = new
                {
                    success = true,
                    message = replaced ? "Organization logo replaced successfully." : "Organization logo uploaded successfully.",
                    data = new { logoUrl }
                };
                return replaced ? Ok(body) : StatusCode(StatusCodes.Status201Created, body);
            });

        // PUT /api/v1/organization/logo  — replace the existing logo
        [HttpPut]
        [Authorize(Roles = "OrganizationAdmin,Organization")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(OrganizationLogoService.MaxBytes + 64 * 1024)]
        public Task<IActionResult> Replace(IFormFile? file) =>
            Run(async () =>
            {
                var (logoUrl, replaced) = await _logos.SaveAsync(file, HttpContext.RequestAborted);
                return Ok(new
                {
                    success = true,
                    message = replaced ? "Organization logo replaced successfully." : "Organization logo uploaded successfully.",
                    data = new { logoUrl }
                });
            });

        // DELETE /api/v1/organization/logo
        [HttpDelete]
        [Authorize(Roles = "OrganizationAdmin,Organization")]
        public Task<IActionResult> Delete() =>
            Run(async () =>
            {
                var removed = await _logos.RemoveAsync(HttpContext.RequestAborted);
                return Ok(new
                {
                    success = true,
                    message = removed ? "Organization logo deleted successfully." : "This organization has no logo.",
                    data = new { logoUrl = (string?)null }
                });
            });

        private static async Task<IActionResult> Run(Func<Task<IActionResult>> action)
        {
            try
            {
                return await action();
            }
            catch (OrganizationLogoException ex)
            {
                return new ObjectResult(new { success = false, message = ex.Message }) { StatusCode = ex.StatusCode };
            }
            catch (UnauthorizedAccessException ex)
            {
                return new UnauthorizedObjectResult(new { success = false, message = ex.Message });
            }
        }
    }
}
