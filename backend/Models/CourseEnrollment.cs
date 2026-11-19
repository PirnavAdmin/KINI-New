using System.ComponentModel.DataAnnotations.Schema;
using TalentSphereAPI.Enums;

namespace TalentSphereAPI.Models
{
    /// <summary>
    /// Public (guest) course enrollment — table <c>CourseEnrollments</c>.
    /// Exists before the student has an account (StudentId is null until
    /// approval). Column names follow the existing MySQL table; see the
    /// mapping in ApplicationDbContext.
    /// </summary>
    public class CourseEnrollment
    {
        /// <summary>Column <c>Id</c>.</summary>
        public int CourseEnrollmentId { get; set; }

        public string EnrollmentNumber { get; set; } = string.Empty;

        /// <summary>Unique per enrollment; used as the UPI transaction reference.</summary>
        public string PaymentReference { get; set; } = string.Empty;

        // Ownership — always taken from the Course on the server.
        public int OrganizationId { get; set; }
        public Organization Organization { get; set; } = null!;

        public int CourseId { get; set; }
        public Course Course { get; set; } = null!;

        /// <summary>Column <c>CurrentBatchId</c>.</summary>
        public int? BatchId { get; set; }
        public Batch? Batch { get; set; }

        // Student details
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        /// <summary>Column <c>MobileNumber</c>.</summary>
        public string Phone { get; set; } = string.Empty;

        /// <summary>Column <c>Qualification</c>.</summary>
        public string? HighestQualification { get; set; }

        /// <summary>Column <c>CollegeName</c>.</summary>
        public string? InstitutionName { get; set; }

        public string? Address { get; set; }

        /// <summary>Column <c>CourseFee</c>: snapshot of Course.Price at creation.</summary>
        public decimal FeeAmount { get; set; }

        [NotMapped] public string Currency => "INR";

        public EnrollmentApplicationStatus EnrollmentStatus { get; set; }
            = EnrollmentApplicationStatus.PendingPayment;

        public EnrollmentPaymentStatus PaymentStatus { get; set; }
            = EnrollmentPaymentStatus.NotSubmitted;

        public EnrollmentAccountStatus AccountStatus { get; set; }
            = EnrollmentAccountStatus.NotCreated;

        /// <summary>Column <c>EnrollmentAccessKeyHash</c>: SHA-256 of the access token.</summary>
        public string? AccessTokenHash { get; set; }

        /// <summary>Column <c>EnrollmentAccessKeyExpiresAt</c>.</summary>
        public DateTime? AccessTokenExpiresAt { get; set; }

        // Links set on approval
        public int? StudentId { get; set; }
        public Student? Student { get; set; }

        public int? UserId { get; set; }
        public User? User { get; set; }

        // Review
        public string? ReviewedBy { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? RejectionReason { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>SHA-256 of the guest's Idempotency-Key for creation (replays return this enrollment).</summary>
        public string? IdempotencyKeyHash { get; set; }

        /// <summary>When the guest accepted the terms (required for guest enrollment).</summary>
        public DateTime? TermsAcceptedAt { get; set; }

        /// <summary>Optimistic concurrency: blocks two reviewers acting at once.</summary>
        public string? ConcurrencyStamp { get; set; } = Guid.NewGuid().ToString();

        public ICollection<CoursePayment> Payments { get; set; } = new List<CoursePayment>();
        public ICollection<EnrollmentApprovalHistory> StatusHistory { get; set; } = new List<EnrollmentApprovalHistory>();

        // Name parts for emails and account provisioning (FullName is stored).
        [NotMapped]
        public string FirstName => SplitName(FullName).First;

        [NotMapped]
        public string LastName => SplitName(FullName).Last;

        public static (string First, string Last) SplitName(string? fullName)
        {
            var parts = (fullName ?? string.Empty).Trim()
                .Split(' ', 2, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            return parts.Length switch
            {
                0 => (string.Empty, string.Empty),
                1 => (parts[0], string.Empty),
                _ => (parts[0], parts[1])
            };
        }
    }

    /// <summary>One UPI payment-proof attempt — table <c>CoursePayments</c>. Rejected attempts are kept.</summary>
    public class CoursePayment
    {
        /// <summary>Column <c>Id</c>.</summary>
        public int CoursePaymentId { get; set; }

        /// <summary>Column <c>EnrollmentId</c>.</summary>
        public int CourseEnrollmentId { get; set; }
        public CourseEnrollment CourseEnrollment { get; set; } = null!;

        /// <summary>Expected amount (the enrollment fee), never the client's value.</summary>
        public decimal Amount { get; set; }

        /// <summary>Column <c>UTRNumber</c> (unique).</summary>
        public string UtrNumber { get; set; } = string.Empty;

        public string PaymentMethod { get; set; } = "UPI";

        public DateTime PaymentDate { get; set; }

        /// <summary>Column <c>ScreenshotPath</c>: private key under App_Data, never served statically.</summary>
        public string ScreenshotStoragePath { get; set; } = string.Empty;
        public string? ScreenshotContentType { get; set; }
        public long? ScreenshotSizeBytes { get; set; }
        public string? ScreenshotSha256 { get; set; }

        /// <summary>Column <c>PaymentStatus</c>.</summary>
        public EnrollmentPaymentStatus Status { get; set; } = EnrollmentPaymentStatus.PendingVerification;

        public string? RejectionReason { get; set; }

        /// <summary>Column <c>Remarks</c>: the reviewer's verification note.</summary>
        public string? ReviewNote { get; set; }

        /// <summary>Column <c>VerifiedBy</c>: reviewing user, when the reviewer is a Users row.</summary>
        public int? VerifiedByUserId { get; set; }

        /// <summary>Reviewer label, e.g. "OrganizationAdmin:5" or "User:12".</summary>
        public string? ReviewedBy { get; set; }

        /// <summary>Column <c>VerifiedAt</c>: when the payment was verified or rejected.</summary>
        public DateTime? ReviewedAt { get; set; }

        /// <summary>Column <c>CreatedAt</c>.</summary>
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        /// <summary>SHA-256 of the guest's Idempotency-Key for this proof (replays return this payment).</summary>
        public string? IdempotencyKeyHash { get; set; }
    }

    /// <summary>Append-only audit trail — table <c>EnrollmentApprovalHistory</c>.</summary>
    public class EnrollmentApprovalHistory
    {
        /// <summary>Column <c>Id</c>.</summary>
        public int EnrollmentApprovalHistoryId { get; set; }

        /// <summary>Column <c>EnrollmentId</c>.</summary>
        public int CourseEnrollmentId { get; set; }
        public CourseEnrollment CourseEnrollment { get; set; } = null!;

        public string Action { get; set; } = string.Empty;

        /// <summary>Column <c>ActionBy</c>: acting user, null for public/organization-owner actions.</summary>
        public int? ActionByUserId { get; set; }

        /// <summary>"Public", "OrganizationAdmin:5", "User:12", "System".</summary>
        public string? Actor { get; set; }

        /// <summary>"EnrollmentStatus|PaymentStatus|AccountStatus" before and after.</summary>
        public string? FromStatus { get; set; }
        public string? ToStatus { get; set; }

        /// <summary>Column <c>Remarks</c>.</summary>
        public string? Reason { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>Batch assignments made during approval — table <c>BatchAssignmentHistory</c>.</summary>
    public class BatchAssignmentHistory
    {
        public int Id { get; set; }
        public int CourseEnrollmentId { get; set; }
        public CourseEnrollment CourseEnrollment { get; set; } = null!;
        public int? PreviousBatchId { get; set; }
        public int NewBatchId { get; set; }

        /// <summary>Column <c>ActionBy</c>.</summary>
        public int? ActionByUserId { get; set; }
        public string? Actor { get; set; }
        public string? Remarks { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>An organization's UPI details — table <c>OrganizationPaymentSettings</c> (one per organization).</summary>
    public class OrganizationPaymentSetting
    {
        public int Id { get; set; }
        public int OrganizationId { get; set; }
        public Organization Organization { get; set; } = null!;
        public string UpiId { get; set; } = string.Empty;
        public string PayeeName { get; set; } = string.Empty;

        /// <summary>Private storage key under App_Data for the uploaded QR image.</summary>
        public string? QrCodePath { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
