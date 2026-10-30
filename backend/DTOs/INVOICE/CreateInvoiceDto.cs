using System.ComponentModel.DataAnnotations;
using TalentSphereAPI.Enums;

namespace TalentSphereAPI.DTOs.Invoice
{
    public class CreateInvoiceDto
    {
        [Required]
        public int StudentId { get; set; }

        [Required]
        public int CourseId { get; set; }

        [Required]
        [Range(0.01, 10000000)]
        public decimal SubTotal { get; set; }

        [Range(0, 10000000)]
        public decimal DiscountAmount { get; set; }

        [Range(0, 100)]
        public decimal TaxPercentage { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }


        // =====================================================
        // BILLING / TAX INFORMATION
        // =====================================================

        [MaxLength(1000)]
        public string? BillingAddress { get; set; }

        [MaxLength(100)]
        public string? PlaceOfSupply { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "INR";

        public InvoiceTaxType TaxType { get; set; }
            = InvoiceTaxType.NotConfigured;
    }
}