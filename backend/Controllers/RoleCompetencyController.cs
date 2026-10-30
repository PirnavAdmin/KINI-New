using Microsoft.AspNetCore.Mvc;

using TalentSphereAPI.DTOs;

using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers

{

    [ApiController]

    [Route("api/[controller]")]

    public class RoleCompetencyController : ControllerBase

    {

        private readonly IRoleCompetencyService _service;

        public RoleCompetencyController(

            IRoleCompetencyService service)

        {

            _service = service;

        }

        [HttpGet]

        public async Task<IActionResult> GetAll()

        {

            return Ok(await _service.GetAllAsync());

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

        public async Task<IActionResult> Create(

            CreateRoleCompetencyDto dto)

        {

            await _service.CreateAsync(dto);

            return Ok(new

            {

                Message = "Role Competency Created Successfully"

            });

        }

        [HttpPut("{id}")]

        public async Task<IActionResult> Update(

            int id,

            UpdateRoleCompetencyDto dto)

        {

            var result =

                await _service.UpdateAsync(id, dto);

            if (!result)

                return NotFound();

            return Ok(new

            {

                Message = "Role Competency Updated Successfully"

            });

        }

        [HttpDelete("{id}")]

        public async Task<IActionResult> Delete(int id)

        {

            var result =

                await _service.DeleteAsync(id);

            if (!result)

                return NotFound();

            return Ok(new

            {

                Message = "Role Competency Deleted Successfully"

            });

        }

    }

}
