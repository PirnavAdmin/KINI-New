using Microsoft.AspNetCore.Mvc;

using TalentSphereAPI.DTOs;

using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers

{

    [Route("api/v1/skills")]

    [ApiController]

    public class SkillsController : ControllerBase

    {

        private readonly ISkillService _service;

        public SkillsController(ISkillService service)

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

        public async Task<IActionResult> Create(CreateSkillDto dto)

        {

            await _service.CreateAsync(dto);

            return Ok(new

            {

                Message = "Skill Created Successfully"

            });

        }

        [HttpPut("{id}")]

        public async Task<IActionResult> Update(

            int id,

            UpdateSkillDto dto)

        {

            var result = await _service.UpdateAsync(id, dto);

            if (!result)

                return NotFound();

            return Ok(new

            {

                Message = "Skill Updated Successfully"

            });

        }

        [HttpDelete("{id}")]

        public async Task<IActionResult> Delete(int id)

        {

            var result = await _service.DeleteAsync(id);

            if (!result)

                return NotFound();

            return Ok(new

            {

                Message = "Skill Deleted Successfully"

            });

        }

    }

}
