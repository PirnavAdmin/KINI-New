using TalentSphereAPI.DTOs.Common;
using TalentSphereAPI.DTOs.Invoice;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly IInvoiceRepository _repository;
        private readonly IInvoicePdfService _pdfService;
        private readonly IEmailService _emailService;
        private readonly INotificationService _notificationService;

        public InvoiceService(
            IInvoiceRepository repository,
            IInvoicePdfService pdfService,
            IEmailService emailService,
            INotificationService notificationService)
        {
            _repository = repository;
            _pdfService = pdfService;
            _emailService = emailService;
            _notificationService = notificationService;
        }

        // =====================================================
        // TAX CALCULATION
        // =====================================================

        private static decimal CalculateTax(
            decimal taxableAmount,
            decimal taxPercentage,
            InvoiceTaxType taxType)
        {
            if (taxType == InvoiceTaxType.None)
                return 0m;

            return Math.Round(
                taxableAmount * taxPercentage / 100m,
                2,
                MidpointRounding.AwayFromZero);
        }

        // =====================================================
        // TAX BREAKDOWN
        // =====================================================

        private static (
            decimal cgst,
            decimal sgst,
            decimal igst)
            GetTaxBreakdown(Invoice invoice)
        {
            if (invoice.TaxAmount <= 0)
                return (0m, 0m, 0m);

            if (invoice.TaxType == InvoiceTaxType.None)
                return (0m, 0m, 0m);

            if (invoice.TaxType == InvoiceTaxType.InterState)
            {
                return (
                    0m,
                    0m,
                    invoice.TaxAmount);
            }

            if (invoice.TaxType == InvoiceTaxType.IntraState)
            {
                var cgst = Math.Round(
                    invoice.TaxAmount / 2m,
                    2,
                    MidpointRounding.AwayFromZero);

                var sgst =
                    invoice.TaxAmount - cgst;

                return (
                    cgst,
                    sgst,
                    0m);
            }

            return (0m, 0m, 0m);
        }

        private static decimal GetHalfRate(
            decimal totalRate)
        {
            return Math.Round(
                totalRate / 2m,
                2,
                MidpointRounding.AwayFromZero);
        }

        // =====================================================
        // MAP RESPONSE
        // =====================================================

        private InvoiceResponseDto MapToResponseDto(
            Invoice invoice)
        {
            var (
                cgst,
                sgst,
                igst) =
                GetTaxBreakdown(invoice);

            var branchAddress =
                invoice.Organization?
                    .Branches?
                    .Where(b =>
                        b.Status &&
                        !string.IsNullOrWhiteSpace(b.Location))
                    .Select(b =>
                        b.Location!.Trim())
                    .FirstOrDefault();

            var studentName =
                invoice.Student == null
                    ? string.Empty
                    : string.Join(
                        " ",
                        new[]
                        {
                            invoice.Student.FirstName,
                            invoice.Student.LastName
                        }
                        .Where(x =>
                            !string.IsNullOrWhiteSpace(x)));

            return new InvoiceResponseDto
            {
                InvoiceId =
                    invoice.InvoiceId,

                InvoiceNumber =
                    invoice.InvoiceNumber,

                OrganizationId =
                    invoice.OrganizationId,

                // STUDENT
                StudentId =
                    invoice.StudentId,

                StudentName =
                    studentName,

                StudentEmail =
                    invoice.Student?.Email ?? string.Empty,

                StudentPhone =
                    invoice.Student?.Phone ?? string.Empty,

                BillingAddress =
                    invoice.BillingAddress?.Trim() ?? string.Empty,

                // COURSE
                CourseId =
                    invoice.CourseId,

                CourseName =
                    invoice.Course?.CourseName ?? string.Empty,

                CourseCode =
                    invoice.Course?.CourseCode ?? string.Empty,

                Duration =
                    invoice.Course?.Duration ?? string.Empty,

                BatchType =
                    invoice.Student?.Batch?.BatchType
                        .ToString() ?? string.Empty,

                // ORGANIZATION
                OrganizationName =
                    invoice.Organization?.OrganizationName
                    ?? string.Empty,

                RegisteredAddress =
                    branchAddress ?? string.Empty,

                OrganizationEmail =
                    invoice.Organization?.Email
                    ?? string.Empty,

                OrganizationPhone =
                    invoice.Organization?.Phone
                    ?? string.Empty,

                OrganizationWebsite =
                    invoice.Organization?.Website
                    ?? string.Empty,

                // TAX
                PlaceOfSupply =
                    invoice.PlaceOfSupply ?? string.Empty,

                Currency =
                    string.IsNullOrWhiteSpace(invoice.Currency)
                        ? "INR"
                        : invoice.Currency,

                TaxType =
                    invoice.TaxType,

                CgstAmount =
                    cgst,

                SgstAmount =
                    sgst,

                IgstAmount =
                    igst,

                CgstRate =
                    invoice.TaxType ==
                    InvoiceTaxType.IntraState
                        ? GetHalfRate(
                            invoice.TaxPercentage)
                        : 0m,

                SgstRate =
                    invoice.TaxType ==
                    InvoiceTaxType.IntraState
                        ? GetHalfRate(
                            invoice.TaxPercentage)
                        : 0m,

                IgstRate =
                    invoice.TaxType ==
                    InvoiceTaxType.InterState
                        ? invoice.TaxPercentage
                        : 0m,

                // PAYMENT
                PaymentMode =
                    string.Empty,

                TransactionReference =
                    string.Empty,

                // AMOUNTS
                SubTotal =
                    invoice.SubTotal,

                DiscountAmount =
                    invoice.DiscountAmount,

                TaxableAmount =
                    invoice.TaxableAmount,

                TaxPercentage =
                    invoice.TaxPercentage,

                TaxAmount =
                    invoice.TaxAmount,

                TotalAmount =
                    invoice.TotalAmount,

                // PAYMENT SUMMARY
                PaidAmount =
                    invoice.PaidAmount,

                BalanceAmount =
                    invoice.BalanceAmount,

                // DATES
                IssueDate =
                    invoice.IssueDate,

                DueDate =
                    invoice.DueDate,

                PaidDate =
                    invoice.PaidDate,

                CancelledDate =
                    invoice.CancelledDate,

                // STATUS
                Status =
                    invoice.Status,

                // NOTES
                Notes =
                    invoice.Notes,

                CancellationReason =
                    invoice.CancellationReason
            };
        }

        // =====================================================
        // GET ALL
        // =====================================================

        public async Task<PagedResponse<InvoiceResponseDto>>
            GetAllAsync(
                InvoiceQueryParameters parameters)
        {
            if (parameters.PageNumber < 1)
                parameters.PageNumber = 1;

            if (parameters.PageSize < 1)
                parameters.PageSize = 10;

            var result =
                await _repository.GetAllAsync(
                    parameters.Search,
                    parameters.Status,
                    parameters.StudentId,
                    parameters.CourseId,
                    parameters.FromDate,
                    parameters.ToDate,
                    parameters.SortBy,
                    parameters.SortOrder,
                    parameters.PageNumber,
                    parameters.PageSize);

            var data =
                result.Invoices
                    .Select(MapToResponseDto)
                    .ToList();

            return new PagedResponse<InvoiceResponseDto>
            {
                Data =
                    data,

                TotalRecords =
                    result.TotalCount,

                PageNumber =
                    parameters.PageNumber,

                PageSize =
                    parameters.PageSize
            };
        }

        // =====================================================
        // GET BY ID
        // =====================================================

        public async Task<InvoiceResponseDto?>
            GetByIdAsync(int id)
        {
            var invoice =
                await _repository.GetByIdAsync(id);

            if (invoice == null)
                return null;

            return MapToResponseDto(invoice);
        }

        // =====================================================
        // CREATE
        // =====================================================

        public async Task<InvoiceResponseDto>
            CreateAsync(CreateInvoiceDto dto)
        {
            if (!await _repository
                .StudentExistsAsync(dto.StudentId))
            {
                throw new KeyNotFoundException(
                    "Student does not exist in your organization.");
            }

            if (!await _repository
                .CourseExistsAsync(dto.CourseId))
            {
                throw new KeyNotFoundException(
                    "Course does not exist in your organization.");
            }

            if (dto.DiscountAmount > dto.SubTotal)
            {
                throw new ArgumentException(
                    "Discount cannot be greater than subtotal.");
            }

            if (dto.DueDate.Date <
                DateTime.UtcNow.Date)
            {
                throw new ArgumentException(
                    "Due date cannot be in the past.");
            }

            var taxableAmount =
                Math.Round(
                    dto.SubTotal -
                    dto.DiscountAmount,
                    2,
                    MidpointRounding.AwayFromZero);

            var taxAmount =
                CalculateTax(
                    taxableAmount,
                    dto.TaxPercentage,
                    dto.TaxType);

            var totalAmount =
                Math.Round(
                    taxableAmount +
                    taxAmount,
                    2,
                    MidpointRounding.AwayFromZero);

            var invoice =
                new Invoice
                {
                    InvoiceNumber =
                        $"TEMP-{Guid.NewGuid():N}",

                    StudentId =
                        dto.StudentId,

                    CourseId =
                        dto.CourseId,

                    BillingAddress =
                        string.IsNullOrWhiteSpace(
                            dto.BillingAddress)
                            ? null
                            : dto.BillingAddress.Trim(),

                    PlaceOfSupply =
                        string.IsNullOrWhiteSpace(
                            dto.PlaceOfSupply)
                            ? null
                            : dto.PlaceOfSupply.Trim(),

                    Currency =
                        string.IsNullOrWhiteSpace(
                            dto.Currency)
                            ? "INR"
                            : dto.Currency
                                .Trim()
                                .ToUpperInvariant(),

                    TaxType =
                        dto.TaxType,

                    SubTotal =
                        dto.SubTotal,

                    DiscountAmount =
                        dto.DiscountAmount,

                    TaxableAmount =
                        taxableAmount,

                    TaxPercentage =
                        dto.TaxPercentage,

                    TaxAmount =
                        taxAmount,

                    TotalAmount =
                        totalAmount,

                    PaidAmount =
                        0m,

                    BalanceAmount =
                        totalAmount,

                    IssueDate =
                        DateTime.UtcNow,

                    DueDate =
                        dto.DueDate,

                    Status =
                        InvoiceStatus.Pending,

                    Notes =
                        dto.Notes,

                    IsDeleted =
                        false
                };

            await _repository.CreateAsync(invoice);

            // =================================================
            // GENERATE FINAL INVOICE NUMBER
            // =================================================

            invoice.InvoiceNumber =
                $"INV-{invoice.IssueDate:yyyyMMdd}-{invoice.InvoiceId:D6}";

            if (await _repository
                .InvoiceNumberExistsAsync(
                    invoice.InvoiceNumber))
            {
                throw new InvalidOperationException(
                    "Invoice number already exists.");
            }

            await _repository.UpdateAsync(invoice);

            // =================================================
            // RELOAD
            // =================================================

            var createdInvoice =
                await _repository
                    .GetByIdAsync(
                        invoice.InvoiceId);

            if (createdInvoice == null)
            {
                throw new InvalidOperationException(
                    "Invoice could not be loaded after creation.");
            }

            // =================================================
            // NOTIFICATION
            // =================================================

            try
            {
                await _notificationService
                    .CreateOrganizationNotificationAsync(
                        createdInvoice.OrganizationId,
                        "New Invoice Created",
                        $"Invoice '{createdInvoice.InvoiceNumber}' " +
                        $"has been created with total amount " +
                        $"{createdInvoice.TotalAmount:0.00}.",
                        NotificationType.InvoiceCreated,
                        createdInvoice.InvoiceId,
                        ReferenceType.Invoice);
            }
            catch
            {
                // Notification failure must not
                // rollback invoice creation.
            }

            return MapToResponseDto(
                createdInvoice);
        }

        // =====================================================
        // UPDATE
        // =====================================================

        public async Task<bool>
            UpdateAsync(
                int id,
                UpdateInvoiceDto dto)
        {
            var invoice =
                await _repository
                    .GetByIdAsync(id);

            if (invoice == null)
                return false;

            if (invoice.Status != InvoiceStatus.Draft &&
                invoice.Status != InvoiceStatus.Pending)
            {
                throw new InvalidOperationException(
                    "Only draft or pending invoices can be updated.");
            }

            if (dto.DiscountAmount >
                dto.SubTotal)
            {
                throw new ArgumentException(
                    "Discount cannot be greater than subtotal.");
            }

            if (dto.DueDate.Date <
                DateTime.UtcNow.Date)
            {
                throw new ArgumentException(
                    "Due date cannot be in the past.");
            }

            var taxableAmount =
                Math.Round(
                    dto.SubTotal -
                    dto.DiscountAmount,
                    2,
                    MidpointRounding.AwayFromZero);

            var taxAmount =
                CalculateTax(
                    taxableAmount,
                    dto.TaxPercentage,
                    dto.TaxType);

            var totalAmount =
                Math.Round(
                    taxableAmount +
                    taxAmount,
                    2,
                    MidpointRounding.AwayFromZero);

            var paidAmount =
                invoice.PaidAmount;

            if (paidAmount > totalAmount)
            {
                throw new InvalidOperationException(
                    "Updated invoice total cannot be less than the amount already paid.");
            }

            invoice.BillingAddress =
                string.IsNullOrWhiteSpace(
                    dto.BillingAddress)
                    ? null
                    : dto.BillingAddress.Trim();

            invoice.PlaceOfSupply =
                string.IsNullOrWhiteSpace(
                    dto.PlaceOfSupply)
                    ? null
                    : dto.PlaceOfSupply.Trim();

            invoice.Currency =
                string.IsNullOrWhiteSpace(
                    dto.Currency)
                    ? "INR"
                    : dto.Currency
                        .Trim()
                        .ToUpperInvariant();

            invoice.TaxType =
                dto.TaxType;

            invoice.SubTotal =
                dto.SubTotal;

            invoice.DiscountAmount =
                dto.DiscountAmount;

            invoice.TaxableAmount =
                taxableAmount;

            invoice.TaxPercentage =
                dto.TaxPercentage;

            invoice.TaxAmount =
                taxAmount;

            invoice.TotalAmount =
                totalAmount;

            invoice.PaidAmount =
                paidAmount;

            invoice.BalanceAmount =
                totalAmount -
                paidAmount;

            invoice.DueDate =
                dto.DueDate;

            invoice.Notes =
                dto.Notes;

            if (paidAmount == 0)
            {
                invoice.Status =
                    InvoiceStatus.Pending;
            }
            else if (paidAmount < totalAmount)
            {
                invoice.Status =
                    InvoiceStatus.PartiallyPaid;
            }
            else
            {
                invoice.Status =
                    InvoiceStatus.Paid;

                invoice.PaidDate ??=
                    DateTime.UtcNow;
            }

            return await _repository
                .UpdateAsync(invoice);
        }

        // =====================================================
        // CANCEL
        // =====================================================

        public async Task<bool>
            CancelAsync(
                int id,
                string? reason)
        {
            var invoice =
                await _repository
                    .GetByIdAsync(id);

            if (invoice == null)
                return false;

            if (invoice.Status ==
                    InvoiceStatus.Paid ||
                invoice.Status ==
                    InvoiceStatus.PartiallyPaid)
            {
                throw new InvalidOperationException(
                    "A paid or partially paid invoice cannot be cancelled.");
            }

            if (invoice.Status ==
                InvoiceStatus.Cancelled)
            {
                return true;
            }

            invoice.Status =
                InvoiceStatus.Cancelled;

            invoice.CancelledDate =
                DateTime.UtcNow;

            invoice.CancellationReason =
                reason;

            return await _repository
                .UpdateAsync(invoice);
        }

        // =====================================================
        // SEND EMAIL
        // =====================================================

        public async Task<bool>
            SendInvoiceEmailAsync(
                int invoiceId,
                SendInvoiceEmailDto dto)
        {
            var invoice =
                await _repository
                    .GetByIdAsync(invoiceId);

            if (invoice == null)
                return false;

            if (invoice.Student == null)
            {
                throw new InvalidOperationException(
                    "Student information is unavailable.");
            }

            var studentEmail =
                invoice.Student.Email;

            if (string.IsNullOrWhiteSpace(studentEmail))
            {
                throw new InvalidOperationException(
                    "Student email not found.");
            }

            var invoiceDto =
                MapToResponseDto(invoice);

            var pdfBytes =
                _pdfService
                    .GenerateInvoicePdf(
                        invoiceDto);

            var subject =
                string.IsNullOrWhiteSpace(dto.Subject)
                    ? $"Invoice {invoice.InvoiceNumber}"
                    : dto.Subject;

            var body =
                string.IsNullOrWhiteSpace(dto.Message)
                    ? $@"
<h3>Hello {invoice.Student.FirstName},</h3>

<p>Your invoice has been generated successfully.</p>

<p>
<b>Invoice Number:</b>
{invoice.InvoiceNumber}
</p>

<p>
<b>Total Amount:</b>
₹{invoice.TotalAmount:0.00}
</p>

<p>
<b>Balance Amount:</b>
₹{invoice.BalanceAmount:0.00}
</p>

<p>
Please find your invoice attached.
</p>

<br/>

<p>
Regards,<br/>
{invoice.Organization?.OrganizationName ?? "Your Organization"}
</p>"
                    : dto.Message;

            await _emailService
                .SendEmailWithAttachmentAsync(
                    studentEmail,
                    subject,
                    body,
                    pdfBytes,
                    $"{invoice.InvoiceNumber}.pdf");

            return true;
        }
    }
}