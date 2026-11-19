using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services
{
    /// <summary>
    /// Puts approved UPI course enrollments into the organization's Invoices
    /// table so they show in the Invoice List. One invoice per enrollment,
    /// numbered INV-{EnrollmentNumber} (the same number as the student's PDF);
    /// the unique (OrganizationId, InvoiceNumber) index blocks duplicates.
    /// Amounts come from the verified payment stored on the server.
    /// </summary>
    public static class UpiEnrollmentInvoices
    {
        public static string NumberFor(CourseEnrollment enrollment) => $"INV-{enrollment.EnrollmentNumber}";

        /// <summary>
        /// Adds (without saving) a Paid invoice for an approved enrollment, unless
        /// one already exists. Returns the new invoice or null.
        /// </summary>
        public static async Task<Invoice?> AddIfMissingAsync(
            ApplicationDbContext context, CourseEnrollment enrollment, CancellationToken ct = default)
        {
            if (enrollment.StudentId is not int studentId ||
                enrollment.EnrollmentStatus != EnrollmentApplicationStatus.Approved ||
                enrollment.PaymentStatus != EnrollmentPaymentStatus.Verified)
                return null;

            var number = NumberFor(enrollment);
            var exists = context.Invoices.Local.Any(i => i.OrganizationId == enrollment.OrganizationId && i.InvoiceNumber == number)
                         || await context.Invoices.AnyAsync(i => i.OrganizationId == enrollment.OrganizationId && i.InvoiceNumber == number, ct);
            if (exists)
                return null;

            var payment = await context.CoursePayments
                .Where(p => p.CourseEnrollmentId == enrollment.CourseEnrollmentId && p.Status == EnrollmentPaymentStatus.Verified)
                .OrderByDescending(p => p.ReviewedAt ?? p.SubmittedAt)
                .FirstOrDefaultAsync(ct);
            if (payment == null)
                return null;

            var paidOn = payment.ReviewedAt ?? payment.SubmittedAt;
            var invoice = new Invoice
            {
                OrganizationId = enrollment.OrganizationId,
                InvoiceNumber = number,
                StudentId = studentId,
                CourseId = enrollment.CourseId,
                BillingAddress = enrollment.Address,
                Currency = "INR",
                TaxType = InvoiceTaxType.None,
                SubTotal = payment.Amount,
                DiscountAmount = 0,
                TaxableAmount = payment.Amount,
                TaxPercentage = 0,
                TaxAmount = 0,
                TotalAmount = payment.Amount,
                PaidAmount = payment.Amount,
                BalanceAmount = 0,
                IssueDate = paidOn,
                DueDate = paidOn,
                PaidDate = paidOn,
                Status = InvoiceStatus.Paid,
                Notes = $"UPI payment (UTR {payment.UtrNumber}). Enrollment {enrollment.EnrollmentNumber}."
            };
            context.Invoices.Add(invoice);
            return invoice;
        }

        /// <summary>
        /// Creates the missing invoices for this organization's already-approved
        /// UPI enrollments (additive only; existing rows are never changed).
        /// </summary>
        public static async Task<int> BackfillAsync(ApplicationDbContext context, int organizationId, CancellationToken ct = default)
        {
            var approved = await context.CourseEnrollments
                .Where(e => e.OrganizationId == organizationId &&
                            e.StudentId != null &&
                            e.EnrollmentStatus == EnrollmentApplicationStatus.Approved &&
                            e.PaymentStatus == EnrollmentPaymentStatus.Verified)
                .ToListAsync(ct);

            var created = 0;
            foreach (var enrollment in approved)
            {
                if (await AddIfMissingAsync(context, enrollment, ct) != null)
                    created++;
            }

            if (created > 0)
                await context.SaveChangesAsync(ct);
            return created;
        }
    }
}
