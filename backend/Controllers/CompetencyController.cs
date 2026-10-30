using Microsoft.AspNetCore.Mvc;

using TalentSphereAPI.DTOs;

using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers

{

    [Route("api/[controller]")]

    [ApiController]

    public class CompetencyController : ControllerBase

    {

        private readonly ICompetencyService _service;

        public CompetencyController(ICompetencyService service)

        {

            _service = service;

        }

        [HttpGet]

        public async Task<IActionResult> GetAll()

        {

            var result = await _service.GetAllAsync();

            return Ok(result);

        }

        [HttpGet("{id}")]

        public async Task<IActionResult> GetById(int id)

        {

            var result = await _service.GetByIdAsync(id);

            if (result == null)

                return NotFound();

            return Ok(result);

        }

        [HttpPost]

        public async Task<IActionResult> Create(CreateCompetencyDto dto)

        {

            await _service.CreateAsync(dto);

            return Ok(new

            {

                Message = "Competency Created Successfully"

            });

        }

        [HttpPut("{id}")]

        public async Task<IActionResult> Update(

            int id,

            UpdateCompetencyDto dto)

        {

            var result = await _service.UpdateAsync(id, dto);

            if (!result)

                return NotFound();

            return Ok(new

            {

                Message = "Competency Updated Successfully"

            });

        }

        [HttpGet("dashboard")]

        public async Task<IActionResult> GetDashboard()

        {

            var result = await _service.GetDashboardAsync();

            return Ok(result);

        }

        [HttpGet("role/{roleId}")]

        public async Task<IActionResult> GetRoleCompetencies(int roleId)

        {

            var result = await _service.GetRoleCompetenciesAsync(roleId);

            return Ok(result);

        }

        [HttpDelete("{id}")]

        public async Task<IActionResult> Delete(int id)

        {

            var result = await _service.DeleteAsync(id);

            if (!result)

                return NotFound();

            return Ok(new

            {

                Message = "Competency Deleted Successfully"

            });

        }

    }

}
