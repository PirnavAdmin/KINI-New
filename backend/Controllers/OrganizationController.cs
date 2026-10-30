using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs.Organization;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [Route("api/v1/organization")]
    [ApiController]
    public class OrganizationController : ControllerBase
    {
        private readonly IOrganizationService _organizationService;

        public OrganizationController(
            IOrganizationService organizationService)
        {
            _organizationService = organizationService;
        }

        // ==========================================
        // REGISTER ORGANIZATION
        // ==========================================

        [HttpPost]
        public async Task<IActionResult> Create(
            CreateOrganizationDto dto)
        {
            var result =
                await _organizationService
                    .RegisterOrganizationAsync(dto);

            return Ok(new
            {
                Message = result
            });
        }

        // ==========================================
        // NORMAL LOGIN
        // ==========================================

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            LoginOrganizationDto dto)
        {
            try
            {
                var result =
                    await _organizationService
                        .LoginAsync(dto);

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    Message = ex.Message
                });
            }
        }

        // ==========================================
        // GOOGLE LOGIN
        // ==========================================

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin(
            GoogleLoginDto dto)
        {
            try
            {
                var result =
                    await _organizationService
                        .GoogleLoginAsync(dto);

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    Message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        Message = ex.Message
                    });
            }
        }

        // ==========================================
        // GET ALL ORGANIZATIONS
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var organizations =
                await _organizationService
                    .GetOrganizationsAsync();

            return Ok(organizations);
        }

        // ==========================================
        // GET ORGANIZATION BY ID
        // ==========================================

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(
            int id)
        {
            var organization =
                await _organizationService
                    .GetByIdAsync(id);

            if (organization == null)
            {
                return NotFound(new
                {
                    Message = "Organization Not Found"
                });
            }

            return Ok(organization);
        }

        // ==========================================
        // UPDATE ORGANIZATION
        // ==========================================

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateOrganizationDto dto)
        {
            var result =
                await _organizationService
                    .UpdateOrganizationAsync(
                        id,
                        dto);

            return Ok(new
            {
                Message = result
            });
        }

        // ==========================================
        // DELETE ORGANIZATION
        // ==========================================

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(
            int id)
        {
            var result =
                await _organizationService
                    .DeleteOrganizationAsync(id);

            return Ok(new
            {
                Message = result
            });
        }
    }
}