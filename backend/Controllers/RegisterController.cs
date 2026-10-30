using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs;
using TalentSphereAPI.Repositories.Interfaces;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegisterController : ControllerBase
    {
        private readonly IRegistrationRepository _repository;

        public RegisterController(IRegistrationRepository repository)
        {
            _repository = repository;
        }

        // POST: api/Register
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegistrationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new
                {
                    Success = false,
                    Message = "Invalid registration details.",
                    Errors = ModelState
                });

            try
            {
                var result = await _repository.CreateAsync(dto);
                return Ok(new
                {
                    Success = true,
                    Message = "Registration completed successfully.",
                    Data = result
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { Success = false, Message = ex.Message });
            }
        }

        // GET: api/Register - protected because this returns personal information
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _repository.GetAllAsync();
            return Ok(new
            {
                Success = true,
                Message = "Registrations retrieved successfully.",
                Data = result
            });
        }

        // GET: api/Register/5 - protected because this returns personal information
        [Authorize]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _repository.GetByIdAsync(id);
            if (result == null)
                return NotFound(new { Success = false, Message = "Registration not found." });

            return Ok(new
            {
                Success = true,
                Message = "Registration retrieved successfully.",
                Data = result
            });
        }
    }
}

