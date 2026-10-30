using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.HR;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/hr/employees")]
    [Authorize]
    public class HrEmployeesController : ControllerBase
    {
        private readonly IHrEmployeeService _service;

        public HrEmployeesController(
            IHrEmployeeService service)
        {
            _service = service;
        }

        [HttpGet("summary")]
        [HasPermission("Employees", "view")]
        public async Task<IActionResult> GetSummary()
        {
            return Ok(
                await _service.GetSummaryAsync());
        }


        [HttpGet]
        [HasPermission("Employees", "view")]
        public async Task<IActionResult> GetEmployees(
            [FromQuery] HrEmployeeQueryDto query)
        {
            return Ok(
                await _service.GetEmployeesAsync(query));
        }


        [HttpGet("department-distribution")]
        [HasPermission("Employees", "view")]
        public async Task<IActionResult>
            GetDepartmentDistribution()
        {
            return Ok(
                await _service
                    .GetDepartmentDistributionAsync());
        }


        [HttpGet("type-distribution")]
        [HasPermission("Employees", "view")]
        public async Task<IActionResult>
            GetTypeDistribution()
        {
            return Ok(
                await _service
                    .GetTypeDistributionAsync());
        }


        [HttpGet("attendance-overview")]
        [HasPermission("Employees", "view")]
        public async Task<IActionResult>
            GetAttendanceOverview()
        {
            return Ok(
                await _service
                    .GetAttendanceOverviewAsync());
        }


        [HttpGet("{employeeId:int}")]
        [HasPermission("Employees", "view")]
        public async Task<IActionResult>
            GetEmployee(int employeeId)
        {
            var result =
                await _service.GetByIdAsync(
                    employeeId);

            if (result == null)
            {
                return NotFound(new
                {
                    error = new
                    {
                        code = "NOT_FOUND",
                        message = "Employee not found."
                    }
                });
            }

            return Ok(result);
        }


        [HttpPost]
        [HasPermission("Employees", "add")]
        public async Task<IActionResult>
            CreateEmployee(
                [FromBody] HrCreateEmployeeDto dto)
        {
            try
            {
                var result =
                    await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetEmployee),
                    new
                    {
                        employeeId =
                            ExtractId(result.Id)
                    },
                    result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    error = new
                    {
                        code = "VALIDATION_ERROR",
                        message = ex.Message
                    }
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    error = new
                    {
                        code = "CONFLICT",
                        message = ex.Message
                    }
                });
            }
        }


        [HttpPut("{employeeId:int}")]
        [HasPermission("Employees", "edit")]
        public async Task<IActionResult>
            UpdateEmployee(
                int employeeId,
                [FromBody] HrUpdateEmployeeDto dto)
        {
            try
            {
                var result =
                    await _service.UpdateAsync(
                        employeeId,
                        dto);

                if (result == null)
                {
                    return NotFound(new
                    {
                        error = new
                        {
                            code = "NOT_FOUND",
                            message = "Employee not found."
                        }
                    });
                }

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    error = new
                    {
                        code = "VALIDATION_ERROR",
                        message = ex.Message
                    }
                });
            }
        }


        [HttpDelete("{employeeId:int}")]
        [HasPermission("Employees", "delete")]
        public async Task<IActionResult>
            DeleteEmployee(int employeeId)
        {
            try
            {
                var result =
                    await _service.DeleteAsync(
                        employeeId);

                if (!result)
                {
                    return NotFound(new
                    {
                        error = new
                        {
                            code = "NOT_FOUND",
                            message = "Employee not found."
                        }
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Employee deleted"
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    error = new
                    {
                        code = "CONFLICT",
                        message = ex.Message
                    }
                });
            }
        }


        [HttpPatch("{employeeId:int}/status")]
        [HasPermission("Employees", "edit")]
        public async Task<IActionResult>
            ChangeStatus(
                int employeeId,
                [FromBody] HrEmployeeStatusDto dto)
        {
            try
            {
                var result =
                    await _service.ChangeStatusAsync(
                        employeeId,
                        dto.Status);

                if (result == null)
                {
                    return NotFound(new
                    {
                        error = new
                        {
                            code = "NOT_FOUND",
                            message = "Employee not found."
                        }
                    });
                }

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    error = new
                    {
                        code = "VALIDATION_ERROR",
                        message = ex.Message
                    }
                });
            }
        }


        [HttpGet("/api/hr/departments")]
        [HasPermission("Employees", "view")]
        public async Task<IActionResult>
            GetDepartments()
        {
            return Ok(
                await _service.GetDepartmentsAsync());
        }


        [HttpGet("/api/hr/roles")]
        [HasPermission("Employees", "view")]
        public async Task<IActionResult>
            GetRoles()
        {
            return Ok(
                await _service.GetRolesAsync());
        }


        private static int ExtractId(
            string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return 0;

            var value =
                id.Replace(
                    "EMP-",
                    "");

            return int.TryParse(
                value,
                out var result)
                    ? result
                    : 0;
        }
    }
}