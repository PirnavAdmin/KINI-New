using Microsoft.AspNetCore.Mvc;

using TalentSphereAPI.DTOs.Team;

using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers

{

    [Route("api/v1/organization/teams")]

    [ApiController]

    public class TeamController : ControllerBase

    {

        private readonly ITeamService _service;

        public TeamController(ITeamService service)

        {

            _service = service;

        }

        [HttpPost]

        public async Task<IActionResult> Create(CreateTeamDto dto)

        {

            var result = await _service.AddTeamAsync(dto);

            return Ok(new { Message = result });

        }

        [HttpGet]

        public async Task<IActionResult> GetAll()

        {

            var result = await _service.GetTeamsAsync();

            return Ok(result);

        }

        [HttpGet("{id}")]

        public async Task<IActionResult> GetById(int id)

        {

            var result = await _service.GetTeamByIdAsync(id);

            if (result == null)

                return NotFound();

            return Ok(result);

        }

        [HttpPut("{id}")]

        public async Task<IActionResult> Update(int id, UpdateTeamDto dto)

        {

            var result = await _service.UpdateTeamAsync(id, dto);

            return Ok(new { Message = result });

        }

        [HttpDelete("{id}")]

        public async Task<IActionResult> Delete(int id)

        {

            var result = await _service.DeleteTeamAsync(id);

            return Ok(new { Message = result });

        }

    }

}
