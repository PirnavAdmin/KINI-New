using Microsoft.AspNetCore.Mvc;

using TalentSphereAPI.DTOs.Goals;

using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers

{

    [ApiController]

    [Route("api/v1/goals")]

    public class GoalController : ControllerBase

    {

        private readonly IGoalService _service;

        public GoalController(

            IGoalService service)

        {

            _service = service;

        }

        [HttpGet]

        public async Task<IActionResult>

            GetAllGoals()

        {

            var goals =

                await _service.GetAllGoalsAsync();

            return Ok(goals);

        }

        [HttpGet("{id}")]

        public async Task<IActionResult>

            GetGoalById(int id)

        {

            var goal =

                await _service

                    .GetGoalByIdAsync(id);

            if (goal == null)

            {

                return NotFound(

                    "Goal not found.");

            }

            return Ok(goal);

        }

        [HttpPost]

        public async Task<IActionResult>

            CreateGoal(

                CreateGoalDto dto)

        {

            var result =

                await _service

                    .CreateGoalAsync(dto);

            return Ok(result);

        }

        [HttpPut("{id}")]

        public async Task<IActionResult>

            UpdateGoal(

                int id,

                UpdateGoalDto dto)

        {

            var result =

                await _service

                    .UpdateGoalAsync(

                        id,

                        dto);

            return Ok(result);

        }

        [HttpDelete("{id}")]

        public async Task<IActionResult>

            DeleteGoal(int id)

        {

            var result =

                await _service

                    .DeleteGoalAsync(id);

            return Ok(result);

        }

    }

}
