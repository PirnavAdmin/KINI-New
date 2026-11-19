using System.Text.Json.Serialization;

namespace TalentSphereAPI.DTOs.PublicEnrollment
{
    // ==========================================================
    // REQUESTS
    // ==========================================================

    /// <summary>
    /// Requirement-document shape:
    /// { "courseId": 25, "studentDetails": { "fullName", "email", "mobile",
    ///   "qualification", "collegeName", "address" } }
    /// </summary>
    public class PublicStudentDetailsDto
    {
        public string? FullName { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? Mobile { get; set; }

        /// <summary>Frontend 17 guest checkout name for <see cref="Mobile"/>.</summary>
        public string? Phone { get; set; }
        public string? Pincode { get; set; }
        public string? State { get; set; }
        public string? Experience { get; set; }
        public string? Qualification { get; set; }
        public string? CollegeName { get; set; }
        public string? Address { get; set; }
    }

    /// <summary>
    /// Public enrollment request. Deliberately has no OrganizationId, StudentId
    /// or amount: organization and fee are derived from the course on the server.
    ///
    /// Accepts either the nested <see cref="StudentDetails"/> shape from the
    /// requirement document or the flat fields used by the web app.
    /// </summary>
    public class CreatePublicEnrollmentDto
    {
        public int CourseId { get; set; }
        public int? BatchId { get; set; }

        public PublicStudentDetailsDto? StudentDetails { get; set; }

        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string HighestQualification { get; set; } = string.Empty;
        public string? InstitutionName { get; set; }
        public int? YearOfPassing { get; set; }
        public string? Address { get; set; }

        /// <summary>
        /// Copies the nested studentDetails into the flat fields (flat fields
        /// win when both are sent). Safe to call more than once.
        /// </summary>
        public CreatePublicEnrollmentDto ApplyStudentDetails()
        {
            var d = StudentDetails;
            if (d == null)
                return this;

            if (string.IsNullOrWhiteSpace(FirstName) && !string.IsNullOrWhiteSpace(d.FirstName))
            {
                FirstName = d.FirstName.Trim();
                if (string.IsNullOrWhiteSpace(LastName)) LastName = d.LastName?.Trim() ?? string.Empty;
            }

            if (string.IsNullOrWhiteSpace(FirstName) && !string.IsNullOrWhiteSpace(d.FullName))
            {
                var parts = d.FullName.Trim().Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                FirstName = parts[0];
                if (string.IsNullOrWhiteSpace(LastName))
                    LastName = parts.Length > 1 ? parts[1].Trim() : string.Empty;
            }

            if (string.IsNullOrWhiteSpace(Email)) Email = d.Email ?? string.Empty;
            if (string.IsNullOrWhiteSpace(Phone)) Phone = (string.IsNullOrWhiteSpace(d.Phone) ? d.Mobile : d.Phone) ?? string.Empty;
            if (string.IsNullOrWhiteSpace(HighestQualification)) HighestQualification = d.Qualification ?? string.Empty;
            if (string.IsNullOrWhiteSpace(InstitutionName)) InstitutionName = d.CollegeName;
            if (string.IsNullOrWhiteSpace(Address))
            {
                var place = string.Join(" - ", new[] { d.State, d.Pincode }
                    .Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x!.Trim()));
                Address = !string.IsNullOrWhiteSpace(d.Address) ? d.Address : (place.Length > 0 ? place : null);
            }

            return this;
        }
    }

    /// <summary>Multipart form for payment proof.</summary>
    public class SubmitPaymentProofDto
    {
        public string UtrNumber { get; set; } = string.Empty;
        public DateTime? PaymentDate { get; set; }

        /// <summary>Optional, for display only: if sent, must equal the server-side fee.</summary>
        public decimal? AmountPaid { get; set; }

        /// <summary>Requirement-document name for <see cref="AmountPaid"/>.</summary>
        public decimal? Amount { get; set; }

        /// <summary>Optional; only "UPI" is accepted.</summary>
        public string? PaymentMethod { get; set; }

        public IFormFile? Screenshot { get; set; }

        /// <summary>Frontend 17 guest checkout name for <see cref="Screenshot"/>.</summary>
        public IFormFile? PaymentScreenshot { get; set; }

        [JsonIgnore]
        public decimal? EffectiveAmount => AmountPaid ?? Amount;

        [JsonIgnore]
        public IFormFile? EffectiveScreenshot => Screenshot ?? PaymentScreenshot;
    }

    public class RequestEnrollmentAccessLinkDto
    {
        public string Email { get; set; } = string.Empty;
        public string EnrollmentNumber { get; set; } = string.Empty;
    }

    // ==========================================================
    // RESPONSES
    // ==========================================================

    public class PublicEnrollmentCreatedDto
    {
        public int EnrollmentId { get; set; }
        public string EnrollmentNumber { get; set; } = string.Empty;

        /// <summary>Always null before approval: applicants have no student record yet.</summary>
        public int? StudentId { get; set; }

        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public int OrganizationId { get; set; }
        public string OrganizationName { get; set; } = string.Empty;
        public decimal CourseFee { get; set; }
        public string Currency { get; set; } = "INR";

        /// <summary>Returned once. The client keeps it and sends it as X-Enrollment-Token.</summary>
        public string AccessToken { get; set; } = string.Empty;

        /// <summary>Requirement-document name for <see cref="AccessToken"/>.</summary>
        public string EnrollmentAccessToken => AccessToken;

        public DateTime AccessTokenExpiresAt { get; set; }

        public string EnrollmentStatus { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public string PaymentReference { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class UpiDetailsDto
    {
        public string? UpiId { get; set; }
        public string? PayeeName { get; set; }
    }

    public class PublicEnrollmentPaymentDetailsDto
    {
        public int EnrollmentId { get; set; }
        public string EnrollmentNumber { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;

        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string? BatchName { get; set; }

        public decimal FeeAmount { get; set; }
        public decimal Amount => FeeAmount;
        public string Currency { get; set; } = "INR";
        public string PaymentMethod => "UPI";

        public string OrganizationName { get; set; } = string.Empty;

        public bool UpiConfigured { get; set; }
        public string? UpiId { get; set; }
        public string? UpiPayeeName { get; set; }
        public UpiDetailsDto? UpiDetails => UpiConfigured ? new UpiDetailsDto { UpiId = UpiId, PayeeName = UpiPayeeName } : null;
        public bool HasQrImage { get; set; }

        /// <summary>Unique per enrollment; sent as tr= and tn= in the UPI link.</summary>
        public string PaymentReference { get; set; } = string.Empty;

        /// <summary>upi://pay deep link with the server-side amount; can be rendered as a QR.</summary>
        public string? UpiPaymentUri { get; set; }
        public string? QrPayload => UpiPaymentUri;

        public List<string> Instructions { get; set; } = new();

        public string EnrollmentStatus { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public bool CanSubmitPayment { get; set; }
        public string? LastRejectionReason { get; set; }
        public int RemainingAttempts { get; set; }
        public long MaxScreenshotBytes { get; set; }
    }

    public class PublicPaymentSummaryDto
    {
        public int PaymentId { get; set; }
        public int EnrollmentId { get; set; }
        public string UtrNumber { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaymentMethod => "UPI";
        public DateTime PaymentDate { get; set; }
        public DateTime SubmittedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentStatus => Status;
        public string? RejectionReason { get; set; }

        /// <summary>Verification note or rejection reason from the organization.</summary>
        public string? Remarks { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public string? VerifiedBy { get; set; }
    }

    public class PublicEnrollmentStatusDto
    {
        public int EnrollmentId { get; set; }
        public string EnrollmentNumber { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string OrganizationName { get; set; } = string.Empty;
        public decimal FeeAmount { get; set; }
        public string Currency { get; set; } = "INR";
        public string PaymentReference { get; set; } = string.Empty;

        public string EnrollmentStatus { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public string AccountStatus { get; set; } = string.Empty;

        /// <summary>
        /// One of: AwaitingPayment, PaymentSubmitted, PaymentVerified,
        /// PaymentRejected, EnrollmentApproved, AccountActive, EnrollmentRejected, Cancelled.
        /// </summary>
        public string Stage { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// What the student should do next: SubmitPayment, ResubmitPayment,
        /// WaitForVerification, WaitForApproval, SetPassword, Login, ContactOrganization.
        /// </summary>
        public string NextAction { get; set; } = string.Empty;

        public bool CanSubmitPayment { get; set; }
        public string? PaymentRejectionReason { get; set; }
        public string? EnrollmentRejectionReason { get; set; }

        public PublicPaymentSummaryDto? LatestPayment { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    /// <summary>GET /api/v1/public/enrollments/{id}: the applicant's own details (token required).</summary>
    public class PublicEnrollmentDetailsDto
    {
        public int EnrollmentId { get; set; }
        public string EnrollmentNumber { get; set; } = string.Empty;
        public PublicEnrollmentStudentDto Student { get; set; } = new();
        public PublicEnrollmentCourseDto Course { get; set; } = new();
        public PublicEnrollmentOrganizationDto Organization { get; set; } = new();
        public string PaymentReference { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public string EnrollmentStatus { get; set; } = string.Empty;
        public string AccountStatus { get; set; } = string.Empty;
        public string Stage { get; set; } = string.Empty;
        public string NextAction { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class PublicEnrollmentStudentDto
    {
        /// <summary>Null until the enrollment is approved and an account is linked.</summary>
        public int? StudentId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string Qualification { get; set; } = string.Empty;
        public string? CollegeName { get; set; }
        public string? Address { get; set; }
    }

    public class PublicEnrollmentCourseDto
    {
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public decimal CourseFee { get; set; }
        public string Currency { get; set; } = "INR";
        public int? BatchId { get; set; }
        public string? BatchName { get; set; }
    }

    public class PublicEnrollmentOrganizationDto
    {
        public int OrganizationId { get; set; }
        public string OrganizationName { get; set; } = string.Empty;
    }

    /// <summary>POST .../payments result: the new attempt plus where the enrollment now stands.</summary>
    public class PaymentSubmittedDto
    {
        public int PaymentId { get; set; }
        public int EnrollmentId { get; set; }
        public string EnrollmentNumber { get; set; } = string.Empty;
        public string UtrNumber { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaymentMethod => "UPI";
        public DateTime PaymentDate { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
        public string EnrollmentStatus { get; set; } = string.Empty;
        public string Stage { get; set; } = string.Empty;
        public string NextAction { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }
    }

    // ==========================================================
    // STUDENT (JWT) — enrollments and payments after login
    // ==========================================================

    public class StudentEnrollmentListItemDto
    {
        public int EnrollmentId { get; set; }
        public string EnrollmentNumber { get; set; } = string.Empty;
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string OrganizationName { get; set; } = string.Empty;
        public decimal CourseFee { get; set; }
        public string Currency { get; set; } = "INR";
        public string PaymentStatus { get; set; } = string.Empty;
        public string EnrollmentStatus { get; set; } = string.Empty;

        /// <summary>True only when payment is Verified AND enrollment is Approved.</summary>
        public bool CourseAccess { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // ==========================================================
    // GUEST CHECKOUT (Frontend 17: /api/v1/guest/enrollments)
    // ==========================================================

    /// <summary>Guest enrollment request: the public request plus required terms acceptance.</summary>
    public class GuestCreateEnrollmentDto : CreatePublicEnrollmentDto
    {
        public bool AcceptedTerms { get; set; }
    }

    public class GuestEnrollmentCreatedDto
    {
        public int EnrollmentId { get; set; }
        public string EnrollmentNumber { get; set; } = string.Empty;

        /// <summary>Per-enrollment capability; send as X-Enrollment-Token. Shown once.</summary>
        public string AccessToken { get; set; } = string.Empty;
        public DateTime AccessTokenExpiresAt { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "INR";
        public string EnrollmentStatus { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class GuestPaymentInfoDto
    {
        public int EnrollmentId { get; set; }
        public string EnrollmentNumber { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string OrganizationName { get; set; } = string.Empty;
        public string? PayeeName { get; set; }
        public string? UpiId { get; set; }

        /// <summary>The organization's QR as a data: URI (no token in any URL), or null.</summary>
        public string? QrCodeUrl { get; set; }
        public string? QrPayload { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "INR";
        public string PaymentReference { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public bool CanSubmitPayment { get; set; }
    }

    public class GuestEnrollmentSummaryDto
    {
        public int EnrollmentId { get; set; }
        public string EnrollmentNumber { get; set; } = string.Empty;
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string EnrollmentStatus { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public string AccountStatus { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "INR";
        public DateTime CreatedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? RejectionReason { get; set; }
    }

    public class GuestPaymentSummaryDto
    {
        public int PaymentId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string UtrNumber { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime SubmittedAt { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public string? RejectionReason { get; set; }
    }

    /// <summary>GET /api/v1/guest/enrollments/{id}.</summary>
    public class GuestEnrollmentStatusDto
    {
        public GuestEnrollmentSummaryDto Enrollment { get; set; } = new();
        public GuestPaymentSummaryDto? Payment { get; set; }

        /// <summary>True only when approved AND the student can sign in (password set or existing account).</summary>
        public bool AccountReady { get; set; }

        /// <summary>True when approved and the student still has to set a password from the emailed link.</summary>
        public bool RequiresPasswordSetup { get; set; }
        public string Stage { get; set; } = string.Empty;
        public string NextAction { get; set; } = string.Empty;
        public bool CanSubmitPayment { get; set; }
    }

    /// <summary>POST /api/v1/guest/account-activation.</summary>
    public class GuestAccountActivationDto
    {
        public string Token { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    /// <summary>POST /api/v1/guest/account-activation/inspect response.</summary>
    public class GuestActivationInfoDto
    {
        /// <summary>"valid", "used" or "expired".</summary>
        public string Status { get; set; } = string.Empty;

        /// <summary>Masked email, e.g. "s***t@example.com".</summary>
        public string? Email { get; set; }
        public string? FirstName { get; set; }
    }

    /// <summary>GET /api/v1/student/payments row (signed-in student, own payments only).</summary>
    public class StudentPaymentListItemDto
    {
        public int PaymentId { get; set; }
        public int EnrollmentId { get; set; }
        public string EnrollmentNumber { get; set; } = string.Empty;
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string OrganizationName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = "UPI";
        public string UtrNumber { get; set; } = string.Empty;

        /// <summary>The UTR, under the name the payments page shows.</summary>
        public string TransactionId => UtrNumber;

        /// <summary>Invoice PDF available (GET /api/v1/student/payments/{id}/invoice) once verified.</summary>
        public bool InvoiceAvailable => Status == "Verified";
        public DateTime PaymentDate { get; set; }
        public DateTime SubmittedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentStatus => Status;
        public DateTime? VerifiedAt { get; set; }
        public string? Remarks { get; set; }
    }
}
