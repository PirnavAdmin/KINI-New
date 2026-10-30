using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.DTOs.Invoice;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Route("api/v1/invoices")]
    [Authorize(Roles = "OrganizationAdmin")]
    public class InvoiceController : ControllerBase
    {
        private readonly IInvoiceService _service;
        private readonly IInvoicePdfService _pdfService;

        public InvoiceController(
            IInvoiceService service,
            IInvoicePdfService pdfService)
        {
            _service = service;
            _pdfService = pdfService;
        }

        // ==========================================
        // GET ALL
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] InvoiceQueryParameters parameters)
        {
            var result =
                await _service.GetAllAsync(
                    parameters);

            return Ok(result);
        }

        // ==========================================
        // GET BY ID
        // ==========================================

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(
            int id)
        {
            var invoice =
                await _service.GetByIdAsync(id);

            if (invoice == null)
            {
                return NotFound(new
                {
                    Message =
                        "Invoice not found."
                });
            }

            return Ok(invoice);
        }

        // ==========================================
        // CREATE
        // ==========================================

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateInvoiceDto dto)
        {
            var invoice =
                await _service.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    id = invoice.InvoiceId
                },
                invoice);
        }

        // ==========================================
        // UPDATE
        // ==========================================

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateInvoiceDto dto)
        {
            var result =
                await _service.UpdateAsync(
                    id,
                    dto);

            if (!result)
            {
                return NotFound(new
                {
                    Message =
                        "Invoice not found."
                });
            }

            return Ok(new
            {
                Message =
                    "Invoice updated successfully."
            });
        }

        // ==========================================
        // CANCEL
        // ==========================================

        [HttpPost("{id:int}/cancel")]
        public async Task<IActionResult> Cancel(
            int id,
            [FromBody] CancelInvoiceDto dto)
        {
            var result =
                await _service.CancelAsync(
                    id,
                    dto.Reason);

            if (!result)
            {
                return NotFound(new
                {
                    Message =
                        "Invoice not found."
                });
            }

            return Ok(new
            {
                Message =
                    "Invoice cancelled successfully."
            });
        }

        // ==========================================
        // PDF
        // ==========================================

        [HttpGet("{id:int}/pdf")]
        public async Task<IActionResult> DownloadPdf(
            int id)
        {
            var invoice =
                await _service.GetByIdAsync(id);

            if (invoice == null)
            {
                return NotFound(new
                {
                    Message =
                        "Invoice not found."
                });
            }

            var pdf =
                _pdfService
                    .GenerateInvoicePdf(
                        invoice);

            return File(
                pdf,
                "application/pdf",
                $"{invoice.InvoiceNumber}.pdf");
        }

        // ==========================================
        // EMAIL
        // ==========================================

        [HttpPost("{id:int}/send-email")]
        public async Task<IActionResult> SendEmail(
            int id,
            [FromBody] SendInvoiceEmailDto dto)
        {
            var result =
                await _service
                    .SendInvoiceEmailAsync(
                        id,
                        dto);

            if (!result)
            {
                return NotFound(new
                {
                    Message =
                        "Invoice not found."
                });
            }

            return Ok(new
            {
                Message =
                    "Invoice emailed successfully."
            });
        }
    }
}