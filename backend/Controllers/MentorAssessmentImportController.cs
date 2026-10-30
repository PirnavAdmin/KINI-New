using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs.AssessmentPdfImport;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Controllers;

[ApiController]
[Route("api/v1/mentor/assessments")]
public class MentorAssessmentController : ControllerBase
{
    private readonly IAssessmentPdfImportService _importService;

    public MentorAssessmentController(
        IAssessmentPdfImportService importService)
    {
        _importService = importService;
    }

    // ============================================================
    // IMPORT ASSESSMENT QUESTIONS FROM PDF
    // ============================================================

    [HttpPost("import-pdf")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ImportPdf(
        IFormFile file,
        CancellationToken cancellationToken)
    {
        // --------------------------------------------------------
        // Validate upload
        // --------------------------------------------------------

        if (file == null ||
            file.Length == 0)
        {
            return BadRequest(new
            {
                success = false,

                message =
                    "Please upload a valid PDF file.",

                error = new
                {
                    code =
                        "ASSESSMENT_PDF_REQUIRED",

                    stage =
                        "PDF_UPLOAD",

                    details =
                        "A valid PDF file is required."
                }
            });
        }

        // --------------------------------------------------------
        // Validate extension
        // --------------------------------------------------------

        if (!string.Equals(
                Path.GetExtension(file.FileName),
                ".pdf",
                StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                success = false,

                message =
                    "Only PDF files are supported.",

                error = new
                {
                    code =
                        "INVALID_FILE_TYPE",

                    stage =
                        "PDF_UPLOAD",

                    details =
                        "Please upload a PDF file."
                }
            });
        }

        try
        {
            // ----------------------------------------------------
            // Parse PDF
            // ----------------------------------------------------

            var result =
                await _importService.ImportAsync(
                    file,
                    cancellationToken);

            // ----------------------------------------------------
            // IMPORTANT:
            //
            // PDF was readable, but no questions were parsed.
            // Do NOT return success=true.
            // ----------------------------------------------------

            if (result.Questions.Count == 0)
            {
                return UnprocessableEntity(new
                {
                    success = false,

                    message =
                        "Assessment PDF parsing failed",

                    error = new
                    {
                        code =
                            "ASSESSMENT_QUESTIONS_NOT_DETECTED",

                        stage =
                            "QUESTION_PARSING",

                        details =
                            "PDF text was extracted successfully, " +
                            "but no valid assessment questions " +
                            "could be parsed."
                    }
                });
            }

            // ----------------------------------------------------
            // Validate individual questions
            // ----------------------------------------------------

            var incompleteQuestions =
                result.Questions
                    .Where(q =>
                        string.IsNullOrWhiteSpace(
                            q.QuestionText) ||
                        string.IsNullOrWhiteSpace(
                            q.QuestionType) ||
                        !q.Marks.HasValue)
                    .Select(q => q.OrderNo)
                    .ToList();

            // We do NOT fail the entire import if some optional
            // information is unavailable.
            //
            // But log it for backend diagnostics.

            if (incompleteQuestions.Count > 0)
            {
                // Optional diagnostic logging can be added here.
            }

            // ----------------------------------------------------
            // SUCCESS
            // ----------------------------------------------------

            return Ok(new
            {
                success = true,

                message =
                    "Assessment PDF processed successfully",

                data = result
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                success = false,

                message =
                    "Invalid assessment PDF",

                error = new
                {
                    code =
                        "INVALID_ASSESSMENT_PDF",

                    stage =
                        "PDF_UPLOAD",

                    details =
                        ex.Message
                }
            });
        }
        catch (InvalidOperationException ex)
        {
            return UnprocessableEntity(new
            {
                success = false,

                message =
                    "Assessment PDF parsing failed",

                error = new
                {
                    code =
                        "ASSESSMENT_PDF_TEXT_EXTRACTION_FAILED",

                    stage =
                        "PDF_TEXT_EXTRACTION",

                    details =
                        ex.Message
                }
            });
        }
    }
}