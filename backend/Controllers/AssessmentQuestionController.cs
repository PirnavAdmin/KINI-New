using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.AssessmentQuestion;
using TalentSphereAPI.Services;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class AssessmentQuestionController : ControllerBase
    {
        private readonly IAssessmentQuestionService _questionService;

        public AssessmentQuestionController(
            IAssessmentQuestionService questionService)
        {
            _questionService = questionService;
        }

        // =====================================================
        // GET QUESTIONS BY ASSESSMENT
        // Assessments -> View
        // =====================================================

        [HttpGet("assessment/{assessmentId:int}")]
        [HasPermission("Assessments", "view")]
        public async Task<IActionResult> GetByAssessment(
            int assessmentId)
        {
            var questions =
                await _questionService
                    .GetByAssessmentAsync(assessmentId);

            return Ok(questions);
        }

        // =====================================================
        // GET QUESTION BY ID
        // Assessments -> View
        // =====================================================

        [HttpGet("{questionId:int}")]
        [HasPermission("Assessments", "view")]
        public async Task<IActionResult> GetById(
            int questionId)
        {
            var question =
                await _questionService
                    .GetByIdAsync(questionId);

            if (question == null)
            {
                return NotFound(new
                {
                    Message =
                        "Question not found."
                });
            }

            return Ok(question);
        }

        // =====================================================
        // CREATE QUESTION
        // Assessments -> Add
        // =====================================================

        [HttpPost]
        [HasPermission("Assessments", "add")]
        public async Task<IActionResult> Create(
    CreateQuestionDto dto)
        {
            try
            {
                var id =
                    await _questionService
                        .CreateAsync(dto);

                return Ok(new
                {
                    Message =
                        "Question created successfully.",
                    QuestionId = id
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }

        // =====================================================
        // UPDATE QUESTION
        // Assessments -> Edit
        // =====================================================

        [HttpPut("{questionId:int}")]
        [HasPermission("Assessments", "edit")]
        public async Task<IActionResult> Update(
     int questionId,
     UpdateQuestionDto dto)
        {
            try
            {
                var updated =
                    await _questionService
                        .UpdateAsync(
                            questionId,
                            dto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        Message =
                            "Question not found."
                    });
                }

                return Ok(new
                {
                    Message =
                        "Question updated successfully."
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }
        // =====================================================
        // DELETE QUESTION
        // Assessments -> Delete
        // =====================================================

        [HttpDelete("{questionId:int}")]
        [HasPermission("Assessments", "delete")]
        public async Task<IActionResult> Delete(
            int questionId)
        {
            var deleted =
                await _questionService
                    .DeleteAsync(questionId);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message =
                        "Question not found."
                });
            }

            return Ok(new
            {
                Message =
                    "Question deleted successfully."
            });
        }
        
    }
}