using Microsoft.AspNetCore.Mvc;

using TalentSphereAPI.DTOs.Department;

using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers

{

    [Route("api/v1/organization/departments")]

    [ApiController]

    public class DepartmentController : ControllerBase

    {

        private readonly IDepartmentService _departmentService;

        public DepartmentController(IDepartmentService departmentService)

        {

            _departmentService = departmentService;

        }

        // CREATE

        [HttpPost]

        public async Task<IActionResult> AddDepartment(CreateDepartmentDto dto)

        {

            var result = await _departmentService.AddDepartmentAsync(dto);

            if (result != "Department Created Successfully")

                return BadRequest(new { Message = result });

            return Ok(new { Message = result });

        }

        // GET ALL (you should pass organizationId via query or auth later)

        [HttpGet]

        public async Task<IActionResult> GetDepartments([FromQuery] int organizationId)

        {

            var departments =

                await _departmentService.GetDepartmentsAsync(organizationId);

            return Ok(departments);

        }

        // GET BY ID

        [HttpGet("{id}")]

        public async Task<IActionResult> GetDepartmentById(int id)

        {

            var department = await _departmentService.GetDepartmentByIdAsync(id);

            if (department == null)

                return NotFound(new { Message = "Department Not Found" });

            return Ok(department);

        }

        // UPDATE

        [HttpPut("{id}")]

        public async Task<IActionResult> UpdateDepartment(int id, UpdateDepartmentDto dto)

        {

            var result = await _departmentService.UpdateDepartmentAsync(id, dto);

            if (result != "Updated Successfully")

                return BadRequest(new { Message = result });

            return Ok(new { Message = result });

        }

        // DELETE

        [HttpDelete("{id}")]

        public async Task<IActionResult> DeleteDepartment(int id)

        {

            var result = await _departmentService.DeleteDepartmentAsync(id);

            if (result != "Deleted Successfully")

                return BadRequest(new { Message = result });

            return Ok(new { Message = result });

        }

    }

}
