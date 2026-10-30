using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.Employee;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/v1/organization/employees")]
    [Authorize]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _service;

        public EmployeeController(IEmployeeService service)
        {
            _service = service;
        }

        
// ============================================================
// GET EMPLOYEE ROLES
// ============================================================

[HttpGet("roles")]
public IActionResult GetEmployeeRoles()
        {
            var roles = new[]
            {
        new
        {
            value = "Employee",
            name = "Employee"
        },
        new
        {
            value = "Mentor",
            name = "Mentor"
        },
        new
        {
            value = "HR",
            name = "HR"
        },
        new
        {
            value = "HRRecruiter",
            name = "HR Recruiter"
        },
        new
        {
            value = "HRExecutive",
            name = "HR Executive"
        },
        new
        {
            value = "OperationAssociate",
            name = "Operation Associate"
        }
    };

            return Ok(roles);
        }


        // ============================================================
        // GET ALL EMPLOYEES
        // Employees -> View
        // ============================================================

        [HttpGet]
        [HasPermission("Employees", "view")]
        public async Task<IActionResult> GetAll(
            [FromQuery] EmployeeQueryParameters query)
        {
            var (employees, totalCount) =
                await _service.GetAllAsync(query);

            return Ok(new
            {
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                TotalPages = query.PageSize > 0
                    ? (int)Math.Ceiling(
                        (double)totalCount / query.PageSize)
                    : 0,
                Data = employees
            });
        }

        // ============================================================
        // GET EMPLOYEE BY ID
        // Employees -> View
        // ============================================================

        [HttpGet("{id:int}")]
        [HasPermission("Employees", "view")]
        public async Task<IActionResult> GetById(int id)
        {
            var employee =
                await _service.GetByIdAsync(id);

            if (employee == null)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = "Employee not found."
                });
            }

            return Ok(employee);
        }

        // ============================================================
        // CREATE EMPLOYEE
        // Employees -> Add
        // ============================================================

        [HttpPost]
        [HasPermission("Employees", "add")]
        public async Task<IActionResult> Create(
            [FromBody] CreateEmployeeDto dto)
        {
            var employee =
                await _service.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    id = employee.EmployeeId
                },
                employee);
        }

        // ============================================================
        // UPDATE EMPLOYEE
        // Employees -> Edit
        // ============================================================

        [HttpPut("{id:int}")]
        [HasPermission("Employees", "edit")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateEmployeeDto dto)
        {
            var employee =
                await _service.UpdateAsync(id, dto);

            if (employee == null)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = "Employee not found."
                });
            }

            return Ok(employee);
        }

        // ============================================================
        // DELETE EMPLOYEE
        // Employees -> Delete
        // ============================================================

        [HttpDelete("{id:int}")]
        [HasPermission("Employees", "delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var result =
                await _service.DeleteAsync(id);

            if (!result)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = "Employee not found."
                });
            }

            return NoContent();
        }
    }
}