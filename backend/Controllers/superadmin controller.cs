using Microsoft.AspNetCore.Mvc;

using TalentSphereAPI.DTOs.SuperAdmin;

using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Controllers

{

    [ApiController]

    [Route("api/v1/SuperAdmin")]

    public class SuperAdminAuthController : ControllerBase

    {

        private readonly ISuperAdminAuthService _service;

        public SuperAdminAuthController(ISuperAdminAuthService service)

        {

            _service = service;

        }

        [HttpPost("login")]

        public async Task<IActionResult> Login(SuperAdminLoginDto dto)

        {

            var token = await _service.LoginAsync(dto);

            return Ok(new

            {

                Success = true,

                Message = "Login successful.",

                Token = token

            });

        }

    }

}
