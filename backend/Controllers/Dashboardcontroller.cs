using Microsoft.AspNetCore.Mvc;

using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers

{

    [ApiController]

    [Route("api/v1")]

    public class DashboardController : ControllerBase

    {

        private readonly IDashboardService _service;

        public DashboardController(

            IDashboardService service)

        {

            _service = service;

        }

        // =========================

        // Super Admin

        // =========================

        [HttpGet("super-admin/dashboard")]

        public async Task<IActionResult>

            GetSuperAdminDashboard()

        {

            return Ok(

                await _service

                    .GetSuperAdminDashboardAsync());

        }

        [HttpGet("super-admin/stats")]

        public async Task<IActionResult>

            GetSuperAdminStats()

        {

            return Ok(

                await _service

                    .GetSuperAdminDashboardAsync());

        }

        // =========================

        // Organization

        // =========================

        [HttpGet("organization/dashboard")]

        public async Task<IActionResult>

            GetOrganizationDashboard()

        {

            return Ok(

                await _service

                    .GetOrganizationDashboardAsync());

        }

        [HttpGet("organization/stats")]

        public async Task<IActionResult>

            GetOrganizationStats()

        {

            return Ok(

                await _service

                    .GetOrganizationDashboardAsync());

        }

        // =========================

        // Employee

        // =========================

        [HttpGet("employee/dashboard")]

        public async Task<IActionResult>

            GetEmployeeDashboard()

        {

            return Ok(

                await _service

                    .GetEmployeeDashboardAsync());

        }

        [HttpGet("employee/stats")]

        public async Task<IActionResult>

            GetEmployeeStats()

        {

            return Ok(

                await _service

                    .GetEmployeeDashboardAsync());

        }

        // =========================

        // Student

        // =========================

        [HttpGet("student/dashboard")]

        public async Task<IActionResult>

            GetStudentDashboard()

        {

            return Ok(

                await _service

                    .GetStudentDashboardAsync());

        }

        [HttpGet("student/stats")]

        public async Task<IActionResult>

            GetStudentStats()

        {

            return Ok(

                await _service

                    .GetStudentDashboardAsync());

        }

    }

}
