using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs;
using TalentSphereAPI.Repositories.Interfaces;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GetInTouchController : ControllerBase
    {
        private readonly IGetInTouchRepository _repository;

        public GetInTouchController(IGetInTouchRepository repository)
        {
            _repository = repository;
        }

        // Public endpoint used by the website contact form.
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] GetInTouchDto dto)
        {
            var result = await _repository.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Id },
                new
                {
                    Success = true,
                    Message = "Thank you for contacting Kini EdX Hub.",
                    Data = new
                    {
                        result.Id,
                        result.Name,
                        result.Email,
                        result.Subject,
                        result.CreatedDate
                    }
                });
        }

        // Contact submissions are private; only authenticated users can read them.
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _repository.GetAllAsync();
            return Ok(new
            {
                Success = true,
                Message = "Contact submissions retrieved successfully.",
                Data = result
            });
        }

        [Authorize]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _repository.GetByIdAsync(id);

            if (result == null)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = "Contact submission not found."
                });
            }

            return Ok(new
            {
                Success = true,
                Message = "Contact submission retrieved successfully.",
                Data = result
            });
        }
    }
}
