using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs.AI;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AIController : ControllerBase
    {
        private readonly IOpenRouterService _openRouterService;
        private readonly IAssessmentAiService _assessmentAiService;

        public AIController(
            IOpenRouterService openRouterService,
            IAssessmentAiService assessmentAiService)
        {
            _openRouterService = openRouterService;
            _assessmentAiService = assessmentAiService;
        }

        // =====================================================
        // AI Chat
        // POST: api/ai/chat
        // =====================================================

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] AIRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Prompt))
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Prompt is required."
                });
            }

            var response =
                await _openRouterService.GetChatResponseAsync(request.Prompt);

            return Ok(new AIResponse
            {
                Response = response
            });
        }

        // =====================================================
        // AI Assessment Question Generator
        // POST: api/ai/assessment/generate
        // =====================================================

        [HttpPost("assessment/generate")]
        public async Task<IActionResult> GenerateAssessment(
            [FromBody] GenerateAssessmentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var assessment =
      await _assessmentAiService.GenerateQuestionsAsync(dto);

            return Ok(new
            {
                Success = true,
                Message = "Assessment created successfully.",
                AssessmentId = assessment.AssessmentId,
                QuestionsGenerated = assessment.Questions.Count
            });
        }
    }
}