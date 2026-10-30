using TalentSphereAPI.Enums;

namespace TalentSphereAPI.DTOs.Invoice
{
    public class InvoiceResponseDto
    {
        // =====================================================
        // INVOICE
        // =====================================================

        public int InvoiceId { get; set; }

        public string InvoiceNumber { get; set; } = string.Empty;

        public int OrganizationId { get; set; }

        // =====================================================
        // STUDENT
        // =====================================================

        public int StudentId { get; set; }

        public string StudentName { get; set; } = string.Empty;

        public string StudentEmail { get; set; } = string.Empty;

        public string StudentPhone { get; set; } = string.Empty;

        public string BillingAddress { get; set; } = string.Empty;

        // =====================================================
        // COURSE
        // =====================================================

        public int CourseId { get; set; }

        public string CourseName { get; set; } = string.Empty;

        public string CourseCode { get; set; } = string.Empty;

        public string Duration { get; set; } = string.Empty;

        public string BatchType { get; set; } = string.Empty;

        // =====================================================
        // ORGANIZATION
        // =====================================================

        public string OrganizationName { get; set; } = string.Empty;

        public string RegisteredAddress { get; set; } = string.Empty;

        public string OrganizationEmail { get; set; } = string.Empty;

        public string OrganizationPhone { get; set; } = string.Empty;

        public string OrganizationWebsite { get; set; } = string.Empty;

        // =====================================================
        // TAX
        // =====================================================

        public string PlaceOfSupply { get; set; } = string.Empty;

        public string Currency { get; set; } = "INR";

        public InvoiceTaxType TaxType { get; set; }

        public decimal CgstAmount { get; set; }

        public decimal SgstAmount { get; set; }

        public decimal IgstAmount { get; set; }

        public decimal CgstRate { get; set; }

        public decimal SgstRate { get; set; }

        public decimal IgstRate { get; set; }

        // =====================================================
        // PAYMENT
        // =====================================================

        public string PaymentMode { get; set; } = string.Empty;

        public string TransactionReference { get; set; } = string.Empty;

        // =====================================================
        // AMOUNTS
        // =====================================================

        public decimal SubTotal { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal TaxableAmount { get; set; }

        public decimal TaxPercentage { get; set; }

        public decimal TaxAmount { get; set; }

        public decimal TotalAmount { get; set; }

        // =====================================================
        // PAYMENT SUMMARY
        // =====================================================

        public decimal PaidAmount { get; set; }

        public decimal BalanceAmount { get; set; }

        // =====================================================
        // DATES
        // =====================================================

        public DateTime IssueDate { get; set; }

        public DateTime DueDate { get; set; }

        public DateTime? PaidDate { get; set; }

        public DateTime? CancelledDate { get; set; }

        // =====================================================
        // STATUS
        // =====================================================

        public InvoiceStatus Status { get; set; }

        // =====================================================
        // NOTES
        // =====================================================

        public string? Notes { get; set; }

        public string? CancellationReason { get; set; }
    }
}