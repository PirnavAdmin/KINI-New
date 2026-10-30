using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;
        private readonly IAttendancePdfService _attendancePdfService;
        private readonly IExcelExportService _excelService;

        public AttendanceController(
            IAttendanceService attendanceService,
            IAttendancePdfService attendancePdfService,
            IExcelExportService excelService)
        {
            _attendanceService = attendanceService;
            _attendancePdfService = attendancePdfService;
            _excelService = excelService;
        }

        // ============================================================
        // STAFF / ADMIN
        // GET ATTENDANCE FOR LIVE CLASS
        //
        // GET:
        // /api/Attendance/liveclass/{liveClassId}
        // ============================================================

        [HttpGet("liveclass/{liveClassId:int}")]
        [HasPermission("Attendance", "view")]
        public async Task<IActionResult> GetAttendanceByLiveClass(
            int liveClassId)
        {
            var attendance =
                await _attendanceService
                    .GetAttendanceByLiveClassAsync(liveClassId);

            return Ok(attendance);
        }

        // ============================================================
        // STUDENT / AUTHENTICATED USER
        // GET STUDENT ATTENDANCE FOR LIVE CLASS
        //
        // GET:
        // /api/Attendance/student/{studentId}/liveclass/{liveClassId}
        //
        // IMPORTANT:
        // No HasPermission here because Student users may not have
        // an Employee record. Ownership/organization validation
        // must be handled by AttendanceService.
        // ============================================================

        [HttpGet("student/{studentId:int}/liveclass/{liveClassId:int}")]
        [Authorize]
        public async Task<IActionResult> GetStudentAttendance(
            int studentId,
            int liveClassId)
        {
            var attendance =
                await _attendanceService
                    .GetStudentAttendanceAsync(
                        studentId,
                        liveClassId);

            if (attendance == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Attendance not found."
                });
            }

            return Ok(new
            {
                success = true,
                data = attendance
            });
        }

        // ============================================================
        // STAFF / ADMIN
        // UPDATE ATTENDANCE
        //
        // PUT:
        // /api/Attendance
        // ============================================================

        [HttpPut]
        [HasPermission("Attendance", "edit")]
        public async Task<IActionResult> UpdateAttendance(
            [FromBody] Attendance attendance)
        {
            await _attendanceService
                .UpdateAttendanceAsync(attendance);

            return Ok(new
            {
                success = true,
                message = "Attendance updated successfully."
            });
        }

        // ============================================================
        // STAFF / ADMIN
        // CREATE ATTENDANCE
        //
        // POST:
        // /api/Attendance/liveclass/{liveClassId}/generate
        // ============================================================

        [HttpPost("liveclass/{liveClassId:int}/generate")]
        [HasPermission("Attendance", "add")]
        public async Task<IActionResult> CreateAttendance(
            int liveClassId)
        {
            await _attendanceService
                .CreateAttendanceForLiveClassAsync(
                    liveClassId);

            return Ok(new
            {
                success = true,
                message = "Attendance records generated successfully."
            });
        }

        // ============================================================
        // STAFF / ADMIN
        // LIVE CLASS DASHBOARD
        //
        // GET:
        // /api/Attendance/liveclass/{liveClassId}/dashboard
        // ============================================================

        [HttpGet("liveclass/{liveClassId:int}/dashboard")]
        [HasPermission("Attendance", "view")]
        public async Task<IActionResult> GetDashboard(
            int liveClassId)
        {
            var result =
                await _attendanceService
                    .GetLiveDashboardAsync(liveClassId);

            return Ok(result);
        }

        // ============================================================
        // STAFF / ADMIN
        // ATTENDANCE REPORT
        //
        // GET:
        // /api/Attendance/report/liveclass/{liveClassId}
        // ============================================================

        [HttpGet("report/liveclass/{liveClassId:int}")]
        [HasPermission("Attendance", "view")]
        public async Task<IActionResult> GetAttendanceReport(
            int liveClassId)
        {
            var report =
                await _attendanceService
                    .GetAttendanceReportAsync(liveClassId);

            return Ok(report);
        }

        // ============================================================
        // STAFF / ADMIN
        // PDF EXPORT
        //
        // GET:
        // /api/Attendance/report/pdf/{liveClassId}
        // ============================================================

        [HttpGet("report/pdf/{liveClassId:int}")]
        [HasPermission("Attendance", "view")]
        public async Task<IActionResult> ExportPdf(
            int liveClassId)
        {
            var pdf =
                await _attendancePdfService
                    .GenerateAttendanceReportPdfAsync(
                        liveClassId);

            return File(
                pdf,
                "application/pdf",
                $"Attendance_{liveClassId}.pdf");
        }

        // ============================================================
        // STAFF / ADMIN
        // EXCEL EXPORT
        //
        // GET:
        // /api/Attendance/report/excel/{liveClassId}
        // ============================================================

        [HttpGet("report/excel/{liveClassId:int}")]
        [HasPermission("Attendance", "view")]
        public async Task<IActionResult> ExportExcel(
            int liveClassId)
        {
            var excel =
                await _excelService
                    .GenerateAttendanceExcelAsync(
                        liveClassId);

            return File(
                excel,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"Attendance_{liveClassId}.xlsx");
        }

        // ============================================================
        // STUDENT
        // GET MY ATTENDANCE FOR LIVE CLASS
        //
        // GET:
        // /api/Attendance/my/liveclass/{liveClassId}
        //
        // StudentId is obtained from the authenticated user
        // by AttendanceService.
        // ============================================================

        [HttpGet("my/liveclass/{liveClassId:int}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyAttendance(
            int liveClassId)
        {
            var attendance =
                await _attendanceService
                    .GetMyAttendanceAsync(liveClassId);

            if (attendance == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Attendance not found."
                });
            }

            return Ok(new
            {
                success = true,
                data = attendance
            });
        }

        // ============================================================
        // STUDENT ATTENDANCE HISTORY
        //
        // GET:
        // /api/Attendance/student/{studentId}
        //
        // IMPORTANT:
        // Do NOT use HasPermission here.
        // AttendanceService must validate:
        // 1. JWT StudentId
        // 2. OrganizationId
        // 3. Requested student belongs to logged-in student
        //
        // This prevents the Student from viewing another student's
        // attendance while avoiding the EmployeePermission 403.
        // ============================================================

        [HttpGet("student/{studentId:int}")]
        [Authorize]
        public async Task<IActionResult> GetAttendanceByStudent(
            int studentId)
        {
            var attendance =
                await _attendanceService
                    .GetAttendanceByStudentAsync(studentId);

            return Ok(new
            {
                success = true,
                data = attendance
            });
        }

        // ============================================================
        // STUDENT ATTENDANCE SUMMARY
        //
        // GET:
        // /api/Attendance/student/{studentId}/summary
        // ============================================================

        [HttpGet("student/{studentId:int}/summary")]
        [Authorize]
        public async Task<IActionResult> GetStudentAttendanceSummary(
            int studentId)
        {
            var summary =
                await _attendanceService
                    .GetStudentAttendanceSummaryAsync(
                        studentId);

            return Ok(new
            {
                success = true,
                data = summary
            });
        }

        // ============================================================
        // STUDENT ATTENDANCE PERCENTAGE
        //
        // GET:
        // /api/Attendance/student/{studentId}/percentage
        // ============================================================

        [HttpGet("student/{studentId:int}/percentage")]
        [Authorize]
        public async Task<IActionResult> GetStudentAttendancePercentage(
            int studentId)
        {
            var percentage =
                await _attendanceService
                    .GetStudentAttendancePercentageAsync(
                        studentId);

            return Ok(new
            {
                success = true,
                data = percentage
            });
        }
    }
}