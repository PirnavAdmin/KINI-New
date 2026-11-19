using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Common;
using TalentSphereAPI.DTOs.PublicEnrollment;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services
{
    /// <summary>
    /// Read-only views of a logged-in student's public enrollments and payment
    /// attempts. Ownership comes from the JWT user id, checked against the
    /// database — never from a client-supplied StudentId.
    /// </summary>
    public interface IStudentEnrollmentQueryService
    {
        Task<PagedResponse<StudentEnrollmentListItemDto>> GetEnrollmentsAsync(int userId, string? status, bool approvedOnly, int page, int pageSize, CancellationToken ct = default);
        Task<List<PublicPaymentSummaryDto>> GetPaymentHistoryAsync(int userId, int enrollmentId, CancellationToken ct = default);
        Task<PublicPaymentSummaryDto> GetPaymentAsync(int userId, int paymentId, CancellationToken ct = default);
        Task<List<StudentPaymentListItemDto>> GetPaymentsAsync(int userId, CancellationToken ct = default);
        Task<(byte[] Pdf, string FileName)> GetPaymentInvoicePdfAsync(int userId, int paymentId, CancellationToken ct = default);
    }

    public class StudentEnrollmentQueryService : IStudentEnrollmentQueryService
    {
        private readonly ApplicationDbContext _context;
        private readonly IInvoicePdfService? _invoicePdf;

        public StudentEnrollmentQueryService(ApplicationDbContext context, IInvoicePdfService? invoicePdf = null)
        {
            _context = context;
            _invoicePdf = invoicePdf;
        }

        public async Task<PagedResponse<StudentEnrollmentListItemDto>> GetEnrollmentsAsync(
            int userId, string? status, bool approvedOnly, int page, int pageSize, CancellationToken ct = default)
        {
            (page, pageSize) = (Math.Max(1, page), Math.Clamp(pageSize, 1, 100));
            var query = await OwnedApplicationsAsync(userId, ct);

            if (approvedOnly)
            {
                query = query.Where(a =>
                    a.EnrollmentStatus == EnrollmentApplicationStatus.Approved &&
                    a.PaymentStatus == EnrollmentPaymentStatus.Verified);
            }
            else if (!string.IsNullOrWhiteSpace(status))
            {
                if (Enum.TryParse<EnrollmentApplicationStatus>(status, true, out var enrollmentStatus))
                    query = query.Where(a => a.EnrollmentStatus == enrollmentStatus);
                else if (Enum.TryParse<EnrollmentPaymentStatus>(status, true, out var paymentStatus))
                    query = query.Where(a => a.PaymentStatus == paymentStatus);
                else
                    throw new EnrollmentValidationException(new() { ["status"] = new[] { $"Unknown status '{status}'." } });
            }

            var total = await query.CountAsync(ct);
            var rows = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new StudentEnrollmentListItemDto
                {
                    EnrollmentId = a.CourseEnrollmentId,
                    EnrollmentNumber = a.EnrollmentNumber,
                    CourseId = a.CourseId,
                    CourseName = a.Course.CourseName,
                    OrganizationName = a.Organization.OrganizationName,
                    CourseFee = a.FeeAmount,
                    Currency = a.Currency,
                    PaymentStatus = a.PaymentStatus.ToString(),
                    EnrollmentStatus = a.EnrollmentStatus.ToString(),
                    CourseAccess = a.EnrollmentStatus == EnrollmentApplicationStatus.Approved &&
                                   a.PaymentStatus == EnrollmentPaymentStatus.Verified,
                    ApprovedAt = a.EnrollmentStatus == EnrollmentApplicationStatus.Approved ? a.ReviewedAt : null,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync(ct);

            return new PagedResponse<StudentEnrollmentListItemDto>
            {
                Data = rows,
                TotalRecords = total,
                PageNumber = page,
                PageSize = pageSize
            };
        }

        public async Task<List<PublicPaymentSummaryDto>> GetPaymentHistoryAsync(
            int userId, int enrollmentId, CancellationToken ct = default)
        {
            var owned = await OwnedApplicationsAsync(userId, ct);
            var application = await owned
                .Include(a => a.Payments)
                .FirstOrDefaultAsync(a => a.CourseEnrollmentId == enrollmentId, ct)
                ?? throw new EnrollmentWorkflowException(404, "ENROLLMENT_NOT_FOUND", "Enrollment not found.");

            return application.Payments
                .OrderByDescending(p => p.SubmittedAt)
                .Select(PublicEnrollmentService.ToSummary)
                .ToList();
        }

        public async Task<PublicPaymentSummaryDto> GetPaymentAsync(
            int userId, int paymentId, CancellationToken ct = default)
        {
            var owned = await OwnedApplicationsAsync(userId, ct);
            var payment = await owned
                .SelectMany(a => a.Payments)
                .FirstOrDefaultAsync(p => p.CoursePaymentId == paymentId, ct)
                ?? throw new EnrollmentWorkflowException(404, "PAYMENT_NOT_FOUND", "Payment not found.");

            return PublicEnrollmentService.ToSummary(payment);
        }

        /// <summary>
        /// Invoice PDF for one of this student's own UPI payments, built with the
        /// existing invoice layout. Only after the organization verified the payment;
        /// nothing is stored (no Invoices row is created).
        /// </summary>
        public async Task<(byte[] Pdf, string FileName)> GetPaymentInvoicePdfAsync(int userId, int paymentId, CancellationToken ct = default)
        {
            var owned = await OwnedApplicationsAsync(userId, ct);
            var row = await owned
                .SelectMany(a => a.Payments)
                .Where(p => p.CoursePaymentId == paymentId)
                .Select(p => new
                {
                    Payment = p,
                    Enrollment = p.CourseEnrollment,
                    p.CourseEnrollment.Course,
                    p.CourseEnrollment.Organization,
                    p.CourseEnrollment.Batch
                })
                .FirstOrDefaultAsync(ct)
                ?? throw new EnrollmentWorkflowException(404, "PAYMENT_NOT_FOUND", "Payment not found.");

            if (row.Payment.Status != EnrollmentPaymentStatus.Verified)
            {
                throw new EnrollmentWorkflowException(409, "INVOICE_NOT_AVAILABLE",
                    "The invoice is available once the organization has verified this payment.");
            }

            if (_invoicePdf == null)
                throw new EnrollmentWorkflowException(500, "INVOICE_UNAVAILABLE", "Invoice generation is not available.");

            var paidOn = row.Payment.ReviewedAt ?? row.Payment.SubmittedAt;
            var invoice = new TalentSphereAPI.DTOs.Invoice.InvoiceResponseDto
            {
                InvoiceNumber = $"INV-{row.Enrollment.EnrollmentNumber}",
                OrganizationId = row.Enrollment.OrganizationId,
                StudentId = row.Enrollment.StudentId ?? 0,
                StudentName = row.Enrollment.FullName,
                StudentEmail = row.Enrollment.Email,
                StudentPhone = row.Enrollment.Phone,
                BillingAddress = row.Enrollment.Address ?? string.Empty,
                CourseId = row.Course.CourseId,
                CourseName = row.Course.CourseName,
                CourseCode = row.Course.CourseCode,
                Duration = row.Course.Duration,
                BatchType = row.Batch != null ? row.Batch.BatchType.ToString() : string.Empty,
                OrganizationName = row.Organization.OrganizationName,
                RegisteredAddress = row.Organization.Country,
                OrganizationEmail = row.Organization.Email,
                OrganizationPhone = row.Organization.Phone,
                OrganizationWebsite = row.Organization.Website,
                Currency = "INR",
                TaxType = InvoiceTaxType.None,
                PaymentMode = "UPI",
                TransactionReference = row.Payment.UtrNumber,
                SubTotal = row.Payment.Amount,
                TaxableAmount = row.Payment.Amount,
                TotalAmount = row.Payment.Amount,
                PaidAmount = row.Payment.Amount,
                BalanceAmount = 0,
                IssueDate = paidOn,
                DueDate = paidOn,
                PaidDate = paidOn,
                Status = InvoiceStatus.Paid,
                Notes = $"UPI payment (UTR {row.Payment.UtrNumber}) verified by {row.Organization.OrganizationName}. " +
                        $"Enrollment {row.Enrollment.EnrollmentNumber}."
            };

            return (_invoicePdf.GenerateInvoicePdf(invoice), $"{invoice.InvoiceNumber}.pdf");
        }

        /// <summary>All of this student's UPI payment attempts, newest first.</summary>
        public async Task<List<StudentPaymentListItemDto>> GetPaymentsAsync(int userId, CancellationToken ct = default)
        {
            var owned = await OwnedApplicationsAsync(userId, ct);
            return await owned
                .SelectMany(a => a.Payments)
                .OrderByDescending(p => p.SubmittedAt)
                .Select(p => new StudentPaymentListItemDto
                {
                    PaymentId = p.CoursePaymentId,
                    EnrollmentId = p.CourseEnrollmentId,
                    EnrollmentNumber = p.CourseEnrollment.EnrollmentNumber,
                    CourseId = p.CourseEnrollment.CourseId,
                    CourseName = p.CourseEnrollment.Course.CourseName,
                    OrganizationName = p.CourseEnrollment.Organization.OrganizationName,
                    Amount = p.Amount,
                    PaymentMethod = p.PaymentMethod == "" ? "UPI" : p.PaymentMethod,
                    UtrNumber = p.UtrNumber,
                    PaymentDate = p.PaymentDate,
                    SubmittedAt = p.SubmittedAt,
                    Status = p.Status.ToString(),
                    VerifiedAt = p.Status == EnrollmentPaymentStatus.Verified ? p.ReviewedAt : null,
                    Remarks = p.RejectionReason ?? p.ReviewNote
                })
                .ToListAsync(ct);
        }

        /// <summary>
        /// Applications linked to this user at approval, plus (for a verified
        /// email) ones submitted with that email before an account was linked —
        /// the same trust the emailed enrollment link already relies on.
        /// </summary>
        private async Task<IQueryable<CourseEnrollment>> OwnedApplicationsAsync(int userId, CancellationToken ct)
        {
            var user = await _context.Users.AsNoTracking()
                .Where(u => u.UserId == userId && u.Role == UserRole.Student && !u.IsDeleted)
                .Select(u => new { u.Email, u.IsEmailVerified })
                .FirstOrDefaultAsync(ct)
                ?? throw new EnrollmentWorkflowException(403, "STUDENT_ACCESS_DENIED",
                    "You are not authorized to access this resource");

            var email = user.IsEmailVerified && !string.IsNullOrWhiteSpace(user.Email)
                ? user.Email.Trim().ToLower()
                : null;

            return _context.CourseEnrollments.AsNoTracking()
                .Where(a => a.UserId == userId || (email != null && a.UserId == null && a.Email == email));
        }
    }
}
