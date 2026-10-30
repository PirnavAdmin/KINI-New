using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs.Role;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers

{

    [Route("api/[controller]")]

    [ApiController]

    public class RoleController : ControllerBase

    {

        private readonly IRoleService _service;

        public RoleController(IRoleService service)

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

        public async Task<IActionResult> Create(CreateRoleDto dto)

        {

            await _service.CreateAsync(dto);

            return Ok(new

            {

                Message = "Role Created Successfully"

            });

        }

        [HttpPut("{id}")]

        public async Task<IActionResult> Update(

            int id,

            UpdateRoleDto dto)

        {

            var result = await _service.UpdateAsync(id, dto);

            if (!result)

                return NotFound();

            return Ok(new

            {

                Message = "Role Updated Successfully"

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

                Message = "Role Deleted Successfully"

            });

        }

    }

}
