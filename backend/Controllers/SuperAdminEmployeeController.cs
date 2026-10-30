using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs.Employee;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/v1/superadmin/organizations/{organizationId:int}/employees")]
    [Authorize(Roles = "SuperAdmin")]
    public class SuperAdminEmployeeController : ControllerBase
    {
        private readonly ISuperAdminEmployeeService _service;

        public SuperAdminEmployeeController(
            ISuperAdminEmployeeService service)
        {
            _service = service;
        }

        // =========================================================
        // GET ALL EMPLOYEES
        // =========================================================
        //
        // GET:
        // /api/v1/superadmin/organizations/2/employees
        //
        // =========================================================

        [HttpGet]
        public async Task<IActionResult> GetAll(
            int organizationId,
            [FromQuery] EmployeeQueryParameters query)
        {
            var (employees, totalCount) =
                await _service.GetAllByOrganizationAsync(
                    organizationId,
                    query);

            return Ok(new
            {
                Success = true,

                OrganizationId =
                    organizationId,

                TotalCount =
                    totalCount,

                PageNumber =
                    query.PageNumber,

                PageSize =
                    query.PageSize,

                TotalPages =
                    query.PageSize > 0
                        ? (int)Math.Ceiling(
                            (double)totalCount /
                            query.PageSize)
                        : 0,

                Data =
                    employees
            });
        }

        // =========================================================
        // GET SINGLE EMPLOYEE
        // =========================================================
        //
        // GET:
        // /api/v1/superadmin/organizations/2/employees/5
        //
        // =========================================================

        [HttpGet("{employeeId:int}")]
        public async Task<IActionResult> GetById(
            int organizationId,
            int employeeId)
        {
            var employee =
                await _service.GetByIdAsync(
                    organizationId,
                    employeeId);

            if (employee == null)
            {
                return NotFound(new
                {
                    Success = false,
                    Message =
                        "Employee not found in the specified organization."
                });
            }

            return Ok(new
            {
                Success = true,
                OrganizationId =
                    organizationId,
                Data =
                    employee
            });
        }
    }
}