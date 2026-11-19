using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.Enums;

namespace TalentSphereAPI.Services
{
    public class FinanceRecentPaymentDto
    {
        /// <summary>"UPI" for enrollment payments (CoursePayments), "Invoice" for invoices recorded as paid.</summary>
        public string Source { get; set; } = string.Empty;
        public int Id { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string? TransactionId { get; set; }
        public DateTime PaidAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? EnrollmentNumber { get; set; }
        public string? InvoiceNumber { get; set; }
    }

    public class FinanceOutstandingInvoiceDto
    {
        public int InvoiceId { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public decimal BalanceAmount { get; set; }
        public DateTime DueDate { get; set; }
        public int DaysOverdue { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class FinanceSummaryDto
    {
        public decimal TotalCollected { get; set; }
        public decimal PendingAmount { get; set; }
        public decimal OverdueAmount { get; set; }
        public int TotalTransactions { get; set; }

        public int VerifiedPayments { get; set; }
        public int PendingVerificationPayments { get; set; }
        public int RejectedPayments { get; set; }

        public string Currency { get; set; } = "INR";
        public List<FinanceRecentPaymentDto> RecentPayments { get; set; } = new();
        public List<FinanceOutstandingInvoiceDto> PendingInvoices { get; set; } = new();
        public List<FinanceOutstandingInvoiceDto> OverdueInvoices { get; set; } = new();
    }

    public interface IFinanceOverviewService
    {
        Task<FinanceSummaryDto> GetSummaryAsync(int organizationId, CancellationToken ct = default);
    }

    /// <summary>
    /// Finance overview for one organization, from the real payment records:
    /// - CoursePayments (UPI enrollment payments): Verified = collected,
    ///   PendingVerification = pending, Rejected = never counted as revenue.
    /// - Invoices created by hand (amount owed / paid on the invoice).
    /// Invoices generated automatically for an approved UPI enrollment
    /// (INV-{EnrollmentNumber}) are the same money as the UPI payment, so
    /// they are excluded here to avoid counting it twice.
    /// </summary>
    public class FinanceOverviewService : IFinanceOverviewService
    {
        private sealed class InvoiceRow
        {
            public int InvoiceId { get; init; }
            public string InvoiceNumber { get; init; } = string.Empty;
            public string StudentName { get; init; } = string.Empty;
            public string CourseName { get; init; } = string.Empty;
            public decimal PaidAmount { get; init; }
            public decimal BalanceAmount { get; init; }
            public DateTime DueDate { get; init; }
            public DateTime? PaidDate { get; init; }
            public DateTime IssueDate { get; init; }
            public InvoiceStatus Status { get; init; }
        }

        private const int RecentLimit = 5;
        private const int ListLimit = 50;
        private readonly ApplicationDbContext _context;

        public FinanceOverviewService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<FinanceSummaryDto> GetSummaryAsync(int organizationId, CancellationToken ct = default)
        {
            var now = DateTime.UtcNow;

            // ---- UPI enrollment payments ----
            var upi = _context.CoursePayments.AsNoTracking()
                .Where(p => p.CourseEnrollment.OrganizationId == organizationId);

            var upiTotals = await upi
                .GroupBy(p => p.Status)
                .Select(g => new { Status = g.Key, Count = g.Count(), Amount = g.Sum(p => p.Amount) })
                .ToListAsync(ct);

            decimal UpiAmount(EnrollmentPaymentStatus s) => upiTotals.Where(t => t.Status == s).Sum(t => t.Amount);
            int UpiCount(EnrollmentPaymentStatus s) => upiTotals.Where(t => t.Status == s).Sum(t => t.Count);

            // ---- Invoices entered by the organization (not the automatic UPI ones) ----
            var manualInvoices = _context.Invoices.AsNoTracking()
                .Where(i => i.OrganizationId == organizationId && !i.IsDeleted)
                .Where(i => !_context.CourseEnrollments.Any(e =>
                    e.OrganizationId == organizationId && i.InvoiceNumber == "INV-" + e.EnrollmentNumber));

            var invoiceRows = await manualInvoices
                .Where(i => i.Status != InvoiceStatus.Cancelled && i.Status != InvoiceStatus.Draft && i.Status != InvoiceStatus.Refunded)
                .Select(i => new InvoiceRow
                {
                    InvoiceId = i.InvoiceId,
                    InvoiceNumber = i.InvoiceNumber,
                    StudentName = i.Student.FirstName + " " + i.Student.LastName,
                    CourseName = i.Course.CourseName,
                    PaidAmount = i.PaidAmount,
                    BalanceAmount = i.BalanceAmount,
                    DueDate = i.DueDate,
                    PaidDate = i.PaidDate,
                    IssueDate = i.IssueDate,
                    Status = i.Status
                })
                .ToListAsync(ct);

            var outstanding = invoiceRows.Where(i => i.BalanceAmount > 0 && i.Status != InvoiceStatus.Paid).ToList();
            var overdue = outstanding.Where(i => i.DueDate < now).ToList();
            var notYetDue = outstanding.Where(i => i.DueDate >= now).ToList();
            var paidInvoices = invoiceRows.Where(i => i.PaidAmount > 0).ToList();

            // ---- Recent completed payments (newest verified / paid first) ----
            var recentUpi = await upi
                .Where(p => p.Status == EnrollmentPaymentStatus.Verified)
                .OrderByDescending(p => p.ReviewedAt ?? p.SubmittedAt)
                .Take(RecentLimit)
                .Select(p => new FinanceRecentPaymentDto
                {
                    Source = "UPI",
                    Id = p.CoursePaymentId,
                    StudentName = p.CourseEnrollment.FullName,
                    CourseName = p.CourseEnrollment.Course.CourseName,
                    Amount = p.Amount,
                    PaymentMethod = "UPI",
                    TransactionId = p.UtrNumber,
                    PaidAt = p.ReviewedAt ?? p.SubmittedAt,
                    Status = "Verified",
                    EnrollmentNumber = p.CourseEnrollment.EnrollmentNumber
                })
                .ToListAsync(ct);

            var recentInvoices = paidInvoices
                .Select(i => new FinanceRecentPaymentDto
                {
                    Source = "Invoice",
                    Id = i.InvoiceId,
                    StudentName = i.StudentName.Trim(),
                    CourseName = i.CourseName,
                    Amount = i.PaidAmount,
                    PaymentMethod = "Invoice",
                    TransactionId = i.InvoiceNumber,
                    PaidAt = i.PaidDate ?? i.IssueDate,
                    Status = i.Status == InvoiceStatus.Paid ? "Paid" : "Partially paid",
                    InvoiceNumber = i.InvoiceNumber
                });

            FinanceOutstandingInvoiceDto Outstanding(InvoiceRow i) => new()
            {
                InvoiceId = i.InvoiceId,
                InvoiceNumber = i.InvoiceNumber,
                StudentName = i.StudentName.Trim(),
                CourseName = i.CourseName,
                BalanceAmount = i.BalanceAmount,
                DueDate = i.DueDate,
                DaysOverdue = i.DueDate < now ? (int)(now - i.DueDate).TotalDays : 0,
                Status = i.Status.ToString()
            };

            return new FinanceSummaryDto
            {
                TotalCollected = UpiAmount(EnrollmentPaymentStatus.Verified) + paidInvoices.Sum(i => i.PaidAmount),
                PendingAmount = UpiAmount(EnrollmentPaymentStatus.PendingVerification) + notYetDue.Sum(i => i.BalanceAmount),
                OverdueAmount = overdue.Sum(i => i.BalanceAmount),
                TotalTransactions = upiTotals.Sum(t => t.Count) + paidInvoices.Count,
                VerifiedPayments = UpiCount(EnrollmentPaymentStatus.Verified),
                PendingVerificationPayments = UpiCount(EnrollmentPaymentStatus.PendingVerification),
                RejectedPayments = UpiCount(EnrollmentPaymentStatus.Rejected),
                RecentPayments = recentUpi.Concat(recentInvoices)
                    .OrderByDescending(p => p.PaidAt)
                    .Take(RecentLimit)
                    .ToList(),
                PendingInvoices = notYetDue.OrderBy(i => i.DueDate).Take(ListLimit).Select(i => Outstanding(i)).ToList(),
                OverdueInvoices = overdue.OrderBy(i => i.DueDate).Take(ListLimit).Select(i => Outstanding(i)).ToList()
            };
        }
    }
}
