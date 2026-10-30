using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs.Subscriptions;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers

{

    [Route("api/v1/subscriptions")]

    [ApiController]

    public class SubscriptionController : ControllerBase

    {

        private readonly ISubscriptionService _service;

        public SubscriptionController(ISubscriptionService service)

        {

            _service = service;

        }

        // GET: api/v1/subscriptions

        [HttpGet]

        public async Task<IActionResult> GetAll()

        {

            var result = await _service.GetAllAsync();

            return Ok(result);

        }

        // GET: api/v1/subscriptions/{id}

        [HttpGet("{id}")]

        public async Task<IActionResult> GetById(int id)

        {

            var result = await _service.GetByIdAsync(id);

            if (result == null)

                return NotFound(new

                {

                    Message = "Subscription not found."

                });

            return Ok(result);

        }

        // POST: api/v1/subscriptions

        [HttpPost]

        public async Task<IActionResult> Create(CreateSubscriptionDto dto)

        {

            await _service.CreateAsync(dto);

            return Ok(new

            {

                Message = "Subscription Created Successfully"

            });

        }

        // PUT: api/v1/subscriptions/{id}

        [HttpPut("{id}")]

        public async Task<IActionResult> Update(int id, UpdateSubscriptionDto dto)

        {

            var result = await _service.UpdateAsync(id, dto);

            if (!result)

                return NotFound(new

                {

                    Message = "Subscription not found."

                });

            return Ok(new

            {

                Message = "Subscription Updated Successfully"

            });

        }

        // DELETE: api/v1/subscriptions/{id}

        [HttpDelete("{id}")]

        public async Task<IActionResult> Delete(int id)

        {

            var result = await _service.DeleteAsync(id);

            if (!result)

                return NotFound(new

                {

                    Message = "Subscription not found."

                });

            return Ok(new

            {

                Message = "Subscription Deleted Successfully"

            });

        }

    }

}
