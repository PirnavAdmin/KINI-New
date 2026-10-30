using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.Batch;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/v1/organization/batches")]
    public class BatchController : ControllerBase
    {
        private readonly IBatchService _service;

        public BatchController(IBatchService service)
        {
            _service = service;
        }

        // =====================================================
        // GET ALL
        // Batches -> View
        // =====================================================

        [HttpGet]
        [HasPermission("Batches", "view")]
        public async Task<IActionResult> GetAll(
            string? search,
            bool? status,
            int pageNumber = 1,
            int pageSize = 10)
        {
            if (pageNumber < 1)
                pageNumber = 1;

            if (pageSize < 1)
                pageSize = 10;

            if (pageSize > 100)
                pageSize = 100;

            var result =
                await _service.GetAllAsync(
                    search,
                    status,
                    pageNumber,
                    pageSize);

            return Ok(result);
        }

        // =====================================================
        // GET BY ID
        // Batches -> View
        // =====================================================

        [HttpGet("{id:int}")]
        [HasPermission("Batches", "view")]
        public async Task<IActionResult> GetById(int id)
        {
            var batch =
                await _service.GetByIdAsync(id);

            if (batch == null)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = "Batch not found."
                });
            }

            return Ok(batch);
        }

        // =====================================================
        // CREATE
        // Batches -> Add
        // =====================================================

        [HttpPost]
        [HasPermission("Batches", "add")]
        public async Task<IActionResult> Create(
            [FromBody] CreateBatchDto dto)
        {
            try
            {
                var result =
                    await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new
                    {
                        id = result.BatchId
                    },
                    result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        // =====================================================
        // UPDATE
        // Batches -> Edit
        // =====================================================

        [HttpPut("{id:int}")]
        [HasPermission("Batches", "edit")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateBatchDto dto)
        {
            try
            {
                var result =
                    await _service.UpdateAsync(id, dto);

                if (result == null)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Batch not found."
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        // =====================================================
        // SUMMARY
        // Batches -> View
        // =====================================================

        [HttpGet("summary")]
        [HasPermission("Batches", "view")]
        public async Task<IActionResult> GetSummary()
        {
            var result =
                await _service.GetSummaryAsync();

            return Ok(new
            {
                success = true,
                message =
                    "Batch summary retrieved successfully.",
                data = result
            });
        }

        // =====================================================
        // DELETE
        // Batches -> Delete
        // =====================================================

        [HttpDelete("{id:int}")]
        [HasPermission("Batches", "delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted =
                await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = "Batch not found."
                });
            }

            return Ok(new
            {
                Success = true,
                Message =
                    "Batch deleted successfully."
            });
        }

        // =====================================================
        // EXPORT TO EXCEL
        // Batches -> View
        // =====================================================

        [HttpGet("export")]
        [HasPermission("Batches", "view")]
        public async Task<IActionResult> Export(
            string? search,
            BatchStatus? status,
            int? courseId,
            int? mentorId,
            string? sortBy,
            string? sortOrder)
        {
            try
            {
                var batches =
                    await _service.ExportAsync(
                        search,
                        status,
                        courseId,
                        mentorId,
                        sortBy,
                        sortOrder);

                using var workbook =
                    new XLWorkbook();

                var worksheet =
                    workbook.Worksheets.Add(
                        "Batch Report");

                worksheet.Cell(1, 1).Value = "Batch Code";
                worksheet.Cell(1, 2).Value = "Batch Name";
                worksheet.Cell(1, 3).Value = "Course";
                worksheet.Cell(1, 4).Value = "Mentor";
                worksheet.Cell(1, 5).Value = "Start Date";
                worksheet.Cell(1, 6).Value = "End Date";
                worksheet.Cell(1, 7).Value = "Status";
                worksheet.Cell(1, 8).Value = "Capacity";
                worksheet.Cell(1, 9).Value = "Enrolled Students";
                worksheet.Cell(1, 10).Value = "Available Seats";
                worksheet.Cell(1, 11).Value = "Created Date";

                var headerRange =
                    worksheet.Range(1, 1, 1, 11);

                headerRange.Style.Font.Bold = true;

                headerRange.Style.Alignment.Horizontal =
                    XLAlignmentHorizontalValues.Center;

                int row = 2;

                foreach (var batch in batches)
                {
                    worksheet.Cell(row, 1).Value =
                        batch.BatchCode;

                    worksheet.Cell(row, 2).Value =
                        batch.BatchName;

                    worksheet.Cell(row, 3).Value =
                        batch.Course;

                    worksheet.Cell(row, 4).Value =
                        batch.Mentor;

                    worksheet.Cell(row, 5).Value =
                        batch.StartDate;

                    worksheet.Cell(row, 5)
                        .Style.DateFormat.Format =
                        "dd-MM-yyyy";

                    worksheet.Cell(row, 6).Value =
                        batch.EndDate;

                    worksheet.Cell(row, 6)
                        .Style.DateFormat.Format =
                        "dd-MM-yyyy";

                    worksheet.Cell(row, 7).Value =
                        batch.Status;

                    worksheet.Cell(row, 8).Value =
                        batch.Capacity;

                    worksheet.Cell(row, 9).Value =
                        batch.EnrolledStudents;

                    worksheet.Cell(row, 10).Value =
                        batch.AvailableSeats;

                    worksheet.Cell(row, 11).Value =
                        batch.CreatedDate;

                    worksheet.Cell(row, 11)
                        .Style.DateFormat.Format =
                        "dd-MM-yyyy HH:mm";

                    row++;
                }

                if (row > 2)
                {
                    var tableRange =
                        worksheet.Range(
                            1,
                            1,
                            row - 1,
                            11);

                    tableRange.CreateTable();
                }

                worksheet.Columns()
                    .AdjustToContents();

                worksheet.SheetView
                    .FreezeRows(1);

                using var stream =
                    new MemoryStream();

                workbook.SaveAs(stream);

                var fileBytes =
                    stream.ToArray();

                var fileName =
                    $"batch-report-{DateTime.UtcNow:yyyy-MM-dd}.xlsx";

                return File(
                    fileBytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    fileName);
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        success = false,
                        message =
                            "Unable to generate batch report.",
                        code = "EXPORT_FAILED"
                    });
            }
        }

        // =====================================================
        // MENTOR BATCHES
        // Batches -> View
        //
        // IMPORTANT:
        // No hard-coded Mentor/OrganizationAdmin role.
        // =====================================================

        [HttpGet(
            "/api/v1/organization/employees/{employeeId:int}/batches")]
        [HasPermission("Batches", "view")]
        public async Task<IActionResult> GetMentorBatches(
            int employeeId,
            int page = 1,
            int pageSize = 10,
            BatchStatus? status = null,
            string? search = null)
        {
            if (employeeId <= 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid employee ID."
                });
            }

            if (page < 1)
                page = 1;

            if (pageSize < 1)
                pageSize = 10;

            if (pageSize > 100)
                pageSize = 100;

            try
            {
                var result =
                    await _service.GetMentorBatchesAsync(
                        employeeId,
                        page,
                        pageSize,
                        status,
                        search);

                return Ok(new
                {
                    success = true,
                    message =
                        result.TotalRecords > 0
                            ? "Mentor batches retrieved successfully."
                            : "No batches found for this mentor.",
                    data = result
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        success = false,
                        message =
                            "Unable to retrieve mentor batches.",
                        error = ex.Message
                    });
            }
        }
    }
}