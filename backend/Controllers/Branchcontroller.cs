using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using TalentSphereAPI.DTOs.Branches;

using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers

{
    [ApiController]
    [Route("api/v1/organization/branches")]
    
    public class BranchController : ControllerBase

    {

        private readonly IBranchService _service;

        public BranchController(

            IBranchService service)

        {

            _service = service;

        }

        [HttpGet]

        public async Task<IActionResult> GetAll()

        {

            return Ok(

                await _service.GetBranchesAsync());

        }

        [HttpGet("{id}")]

        public async Task<IActionResult> GetById(

            int id)

        {

            var branch =

                await _service.GetByIdAsync(id);

            if (branch == null)

                return NotFound();

            return Ok(branch);

        }

        [HttpPost]

        public async Task<IActionResult> Create(

            CreateBranchDto dto)

        {

            var result =

                await _service.CreateBranchAsync(dto);

            return Ok(new

            {

                Message = result

            });

        }

        [HttpPut("{id}")]

        public async Task<IActionResult> Update(

            int id,

            UpdateBranchDto dto)

        {

            var result =

                await _service.UpdateBranchAsync(

                    id, dto);

            return Ok(new

            {

                Message = result

            });

        }

        [HttpDelete("{id}")]

        public async Task<IActionResult> Delete(

            int id)

        {

            var result =

                await _service.DeleteBranchAsync(id);

            return Ok(new

            {

                Message = result

            });

        }

    }

}
