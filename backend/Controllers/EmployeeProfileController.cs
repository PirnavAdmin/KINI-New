using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.EmployeeProfile;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers;

[ApiController]
[Route("api/v1/employee-profile")]
[Authorize]
public class EmployeeProfileController : ControllerBase
{
    private readonly IEmployeeProfileService _service;

    public EmployeeProfileController(
        IEmployeeProfileService service)
    {
        _service = service;
    }

    // =========================================================
    // GET COMPLETE PROFILE
    // =========================================================

    [HttpGet]
    [HasPermission("EmployeeProfile", "View")]
    public async Task<IActionResult> Get()
    {
        var result =
            await _service.GetAsync();

        return Ok(new
        {
            Success = true,
            Data = result
        });
    }

    // =========================================================
    // ORGANIZATION - GET EMPLOYEE PROFILE BY ID
    // =========================================================

    [HttpGet("{employeeId:int}")]
    [HasPermission("EmployeeProfile", "View")]
    public async Task<IActionResult> GetByEmployeeId(int employeeId)
    {
        var result =
            await _service.GetByEmployeeIdAsync(employeeId);

        return Ok(new
        {
            Success = true,
            Data = result
        });
    }

    // =========================================================
    // UPDATE PERSONAL INFORMATION
    // =========================================================

    [HttpPut("personal")]
    [HasPermission("EmployeeProfile", "Edit")]
    public async Task<IActionResult> UpdatePersonal(
        [FromBody] UpdatePersonalInfoDto dto)
    {
        var result =
            await _service.UpdatePersonalAsync(dto);

        return Ok(new
        {
            Success = true,
            Message =
                "Personal information updated successfully.",
            Data = result
        });
    }

    // =========================================================
    // UPDATE BANK + SALARY
    // =========================================================

    [HttpPut("bank")]
    [HasPermission("EmployeeProfile", "Edit")]
    public async Task<IActionResult> UpdateBank(
        [FromBody] UpdateBankInfoDto dto)
    {
        var result =
            await _service.UpdateBankAsync(dto);

        return Ok(new
        {
            Success = true,
            Message =
                "Bank and salary information updated successfully.",
            Data = result
        });
    }

    // =========================================================
    // SAVE EDUCATION
    // =========================================================

    [HttpPut("education")]
    [HasPermission("EmployeeProfile", "Edit")]
    public async Task<IActionResult> SaveEducation(
        [FromBody] SaveEducationDto dto)
    {
        var result =
            await _service.SaveEducationAsync(dto);

        return Ok(new
        {
            Success = true,
            Message =
                "Education information updated successfully.",
            Data = result
        });
    }

    // =========================================================
    // SAVE EXPERIENCE
    // =========================================================

    [HttpPut("experience")]
    [HasPermission("EmployeeProfile", "Edit")]
    public async Task<IActionResult> SaveExperience(
        [FromBody] SaveExperienceDto dto)
    {
        var result =
            await _service.SaveExperienceAsync(dto);

        return Ok(new
        {
            Success = true,
            Message =
                "Work experience updated successfully.",
            Data = result
        });
    }

    // =========================================================
    // GET DEPARTMENTS
    // =========================================================

    [HttpGet("departments")]
    [HasPermission("EmployeeProfile", "View")]
    public async Task<IActionResult> GetDepartments()
    {
        var result =
            await _service.GetDepartmentsAsync();

        return Ok(new
        {
            Success = true,
            Data = result
        });
    }

    // =========================================================
    // GET DOCUMENT TYPES
    // =========================================================

    [HttpGet("document-types")]
    [HasPermission("EmployeeProfile", "View")]
    public IActionResult GetDocumentTypes()
    {
        var data = new[]
        {
            new
            {
                Category = "Education Certificates",
                DocumentType = "10th Certificate"
            },
            new
            {
                Category = "Education Certificates",
                DocumentType = "Intermediate / 12th Certificate"
            },
            new
            {
                Category = "Education Certificates",
                DocumentType = "Degree Certificate"
            },
            new
            {
                Category = "Education Certificates",
                DocumentType = "Post-Graduation Certificate"
            },
            new
            {
                Category = "Identity Documents",
                DocumentType = "Aadhaar Card"
            },
            new
            {
                Category = "Identity Documents",
                DocumentType = "PAN Card"
            },
            new
            {
                Category = "Identity Documents",
                DocumentType = "Passport"
            },
            new
            {
                Category = "Identity Documents",
                DocumentType = "Passport-size Photo"
            },
            new
            {
                Category = "Current Company",
                DocumentType = "Signed Offer Letter"
            },
            new
            {
                Category = "Previous Experience / Internship",
                DocumentType = "Previous - Offer Letter"
            },
            new
            {
                Category = "Previous Experience / Internship",
                DocumentType = "Previous - Appointment Letter"
            },
            new
            {
                Category = "Previous Experience / Internship",
                DocumentType = "Previous - Relieving / Experience Letter"
            },
            new
            {
                Category = "Last 3 Months Payslips",
                DocumentType = "Payslip - Month 1"
            },
            new
            {
                Category = "Last 3 Months Payslips",
                DocumentType = "Payslip - Month 2"
            },
            new
            {
                Category = "Last 3 Months Payslips",
                DocumentType = "Payslip - Month 3"
            }
        };

        return Ok(new
        {
            Success = true,
            Data = data
        });
    }

    // =========================================================
    // UPLOAD DOCUMENT
    // =========================================================

    [HttpPost("documents")]
    [HasPermission("EmployeeProfile", "Add")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(4 * 1024 * 1024)]
    public async Task<IActionResult> UploadDocument(
        [FromForm] UploadEmployeeDocumentDto dto)
    {
        if (dto == null)
        {
            return BadRequest(new
            {
                Success = false,
                Message = "Upload data is required."
            });
        }

        if (dto.File == null ||
            dto.File.Length == 0)
        {
            return BadRequest(new
            {
                Success = false,
                Message = "Please select a file."
            });
        }

        if (string.IsNullOrWhiteSpace(dto.DocumentType))
        {
            return BadRequest(new
            {
                Success = false,
                Message = "Document type is required."
            });
        }

        var result =
            await _service.UploadDocumentAsync(
                dto.DocumentType,
                dto.File);

        return Ok(new
        {
            Success = true,
            Message =
                "Document uploaded successfully.",
            Data = result
        });
    }

    // =========================================================
    // DELETE DOCUMENT
    // =========================================================

    [HttpDelete("documents/{documentId:int}")]
    [HasPermission("EmployeeProfile", "Delete")]
    public async Task<IActionResult> DeleteDocument(
        int documentId)
    {
        var deleted =
            await _service.DeleteDocumentAsync(
                documentId);

        if (!deleted)
        {
            return NotFound(new
            {
                Success = false,
                Message = "Document not found."
            });
        }

        return Ok(new
        {
            Success = true,
            Message =
                "Document deleted successfully."
        });
    }

    // =========================================================
    // DOWNLOAD DOCUMENT
    // =========================================================

    [HttpGet("documents/{documentId:int}/download")]
    [HasPermission("EmployeeProfile", "View")]
    public async Task<IActionResult> DownloadDocument(
        int documentId)
    {
        var result =
            await _service.DownloadDocumentAsync(
                documentId);

        return File(
            result.Bytes,
            result.ContentType,
            result.FileName,
            enableRangeProcessing: true);
    }

    // =========================================================
    // DOWNLOAD PROFILE PDF
    // =========================================================

    [HttpGet("pdf")]
    [HasPermission("EmployeeProfile", "View")]
    public async Task<IActionResult> DownloadProfilePdf()
    {
        var pdf =
            await _service.GeneratePdfAsync();

        return File(
            pdf,
            "application/pdf",
            "EmployeeProfile.pdf");
    }
}