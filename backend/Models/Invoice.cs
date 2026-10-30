using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TalentSphereAPI.Enums;

namespace TalentSphereAPI.Models
{
    public class Invoice : BaseEntity
    {
        [Key]
        public int InvoiceId { get; set; }

        // =====================================================
        // ORGANIZATION / TENANT
        // =====================================================

        [Required]
        public int OrganizationId { get; set; }

        public Organization Organization { get; set; } = null!;

        // =====================================================
        // INVOICE NUMBER
        // =====================================================

        [Required]
        [MaxLength(50)]
        public string InvoiceNumber { get; set; } = string.Empty;

        // =====================================================
        // CUSTOMER
        // =====================================================

        [Required]
        public int StudentId { get; set; }

        public Student Student { get; set; } = null!;

        // =====================================================
        // COURSE
        // =====================================================

        [Required]
        public int CourseId { get; set; }

        public Course Course { get; set; } = null!;

        // =====================================================
        // INVOICE SNAPSHOT
        // =====================================================

        // Address captured when invoice is created.
        // This prevents future student profile changes
        // from changing an already issued invoice.
        [MaxLength(1000)]
        public string? BillingAddress { get; set; }

        // State / jurisdiction used for GST calculation.
        [MaxLength(100)]
        public string? PlaceOfSupply { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "INR";

        public InvoiceTaxType TaxType { get; set; }
            = InvoiceTaxType.NotConfigured;

        // =====================================================
        // AMOUNTS
        // =====================================================

        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxableAmount { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal TaxPercentage { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        // =====================================================
        // PAYMENT
        // =====================================================

        [Column(TypeName = "decimal(18,2)")]
        public decimal PaidAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
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
            = InvoiceStatus.Pending;

        // =====================================================
        // NOTES
        // =====================================================

        [MaxLength(1000)]
        public string? Notes { get; set; }

        // =====================================================
        // CANCELLATION
        // =====================================================

        [MaxLength(500)]
        public string? CancellationReason { get; set; }
    }
}