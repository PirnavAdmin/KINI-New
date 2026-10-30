using TalentSphereAPI.Enums;

namespace TalentSphereAPI.DTOs.Invoice
{
    public class InvoiceListDto
    {
        public int InvoiceId { get; set; }

        public string InvoiceNumber { get; set; } = string.Empty;

        public string StudentName { get; set; } = string.Empty;

        public string CourseName { get; set; } = string.Empty;

        public decimal TotalAmount { get; set; }

        public decimal PaidAmount { get; set; }

        public decimal BalanceAmount { get; set; }

        public InvoiceStatus Status { get; set; }

        public DateTime IssueDate { get; set; }

        public DateTime DueDate { get; set; }
    }
}