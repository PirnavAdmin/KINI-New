namespace TalentSphereAPI.DTOs.PublicEnrollment
{
    // ==========================================================
    // PAYMENT VERIFICATION
    // ==========================================================

    public class EnrollmentPaymentReviewItemDto
    {
        public int PaymentId { get; set; }
        public int EnrollmentId { get; set; }
        public string EnrollmentNumber { get; set; } = string.Empty;

        public string StudentName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string HighestQualification { get; set; } = string.Empty;

        // Requirement-document names.
        public string StudentEmail => Email;
        public string Mobile => Phone;

        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string? BatchName { get; set; }

        /// <summary>Server-side course fee for this enrollment.</summary>
        public decimal CourseFee { get; set; }
        public decimal ExpectedAmount => CourseFee;

        /// <summary>Amount the student was asked to pay (always the course fee).</summary>
        public decimal Amount { get; set; }
        public decimal AmountPaid => Amount;
        public string PaymentMethod => "UPI";
        public string Currency { get; set; } = "INR";
        public string UtrNumber { get; set; } = string.Empty;
        public DateTime PaymentDate { get; set; }
        public DateTime SubmittedAt { get; set; }

        public string Status { get; set; } = string.Empty;
        public string PaymentStatus => Status;
        public string EnrollmentStatus { get; set; } = string.Empty;
        public string? RejectionReason { get; set; }

        /// <summary>Verification note or rejection reason.</summary>
        public string? Remarks { get; set; }
        public string? ReviewedBy { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? VerifiedBy => Status == "Verified" ? ReviewedBy : null;
        public DateTime? VerifiedAt => Status == "Verified" ? ReviewedAt : null;
        public string? RejectedBy => Status == "Rejected" ? ReviewedBy : null;
        public DateTime? RejectedAt => Status == "Rejected" ? ReviewedAt : null;

        /// <summary>1-based attempt number for this enrollment.</summary>
        public int AttemptNumber { get; set; }
        public int PreviousRejections { get; set; }

        /// <summary>Authorized API path for the screenshot (requires the same JWT).</summary>
        public string ScreenshotUrl { get; set; } = string.Empty;
        public string ScreenshotContentType { get; set; } = string.Empty;
    }

    public class VerifyEnrollmentPaymentDto
    {
        /// <summary>
        /// The reviewer confirms they matched the UTR/amount in the bank or UPI statement.
        /// Omitted = confirmed through the verify dialog; explicitly false is refused.
        /// </summary>
        public bool? ConfirmBankTransactionChecked { get; set; }
        public string? Note { get; set; }

        /// <summary>Requirement-document name for <see cref="Note"/>.</summary>
        public string? Remarks { get; set; }

        public string? EffectiveNote => string.IsNullOrWhiteSpace(Note) ? Remarks : Note;
    }

    public class RejectWithReasonDto
    {
        public string Reason { get; set; } = string.Empty;

        /// <summary>Requirement-document name for <see cref="Reason"/>.</summary>
        public string? Remarks { get; set; }

        /// <summary>Frontend 17 name for <see cref="Reason"/> on enrollment rejection.</summary>
        public string? RejectionReason { get; set; }

        public string EffectiveReason =>
            !string.IsNullOrWhiteSpace(Reason) ? Reason
            : !string.IsNullOrWhiteSpace(Remarks) ? Remarks!
            : RejectionReason ?? string.Empty;
    }

    // ==========================================================
    // ENROLLMENT APPROVAL
    // ==========================================================

    public class EnrollmentApprovalItemDto
    {
        public int EnrollmentId { get; set; }
        public string EnrollmentNumber { get; set; } = string.Empty;

        public string StudentName { get; set; } = string.Empty;
        public string FirstName => TalentSphereAPI.Models.CourseEnrollment.SplitName(StudentName).First;
        public string LastName => TalentSphereAPI.Models.CourseEnrollment.SplitName(StudentName).Last;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string HighestQualification { get; set; } = string.Empty;
        public string? InstitutionName { get; set; }
        public string? CollegeName => InstitutionName;
        public int? YearOfPassing { get; set; }
        public string? Address { get; set; }

        /// <summary>Null until approval links a student record.</summary>
        public int? StudentId { get; set; }

        public int OrganizationId { get; set; }

        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public int? BatchId { get; set; }
        public string? BatchName { get; set; }

        public decimal FeeAmount { get; set; }
        public decimal CourseFee => FeeAmount;
        public string Currency { get; set; } = "INR";

        public string EnrollmentStatus { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public string AccountStatus { get; set; } = string.Empty;

        /// <summary>True only when payment is Verified AND enrollment is Approved.</summary>
        public bool CourseAccess => PaymentStatus == "Verified" && EnrollmentStatus == "Approved";

        public int? VerifiedPaymentId { get; set; }
        public string? VerifiedUtrNumber { get; set; }
        public DateTime? PaymentVerifiedAt { get; set; }
        public string? PaymentVerifiedBy { get; set; }

        public string? ReviewedBy { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? RejectionReason { get; set; }
        public string? ApprovedBy => EnrollmentStatus == "Approved" ? ReviewedBy : null;
        public DateTime? ApprovedAt => EnrollmentStatus == "Approved" ? ReviewedAt : null;
        public string? LastProvisioningError { get; set; }
        public int ProvisioningAttempts { get; set; }

        /// <summary>True when an account already exists for this email (approval will link it).</summary>
        public bool ExistingAccount { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class ApproveEnrollmentDto
    {
        /// <summary>Required: batch of this enrollment's course and organization (validated server-side).</summary>
        public int? BatchId { get; set; }

        /// <summary>Frontend 17 sends this flag; approval is implied by the route.</summary>
        public bool? IsApproved { get; set; }

        /// <summary>Optional note saved in the approval history.</summary>
        public string? Remarks { get; set; }
    }

    /// <summary>GET /organization/enrollments/{id}/batches: eligible batches for one enrollment.</summary>
    public class ApprovalBatchOptionsDto
    {
        public int EnrollmentId { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;

        /// <summary>The batch the student picked at enrollment, when it is still eligible.</summary>
        public int? StudentChosenBatchId { get; set; }
        public List<ApprovalBatchOptionDto> Batches { get; set; } = new();
    }

    public class ApprovalBatchOptionDto
    {
        public int BatchId { get; set; }
        public string BatchName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Capacity { get; set; }
        public int EnrolledStudents { get; set; }
        public int SeatsAvailable => Math.Max(0, Capacity - EnrolledStudents);
    }

    public class EnrollmentApprovalResultDto
    {
        public int EnrollmentId { get; set; }
        public int? StudentId { get; set; }
        public int CourseId { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
        public string EnrollmentStatus { get; set; } = string.Empty;
        public bool CourseAccess => PaymentStatus == "Verified" && EnrollmentStatus == "Approved";
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? Remarks { get; set; }
        public string AccountStatus { get; set; } = string.Empty;
        public bool LinkedExistingAccount { get; set; }
        public bool SetupEmailSent { get; set; }
        public bool AlreadyApproved { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class EnrollmentHistoryItemDto
    {
        public string Action { get; set; } = string.Empty;
        public string? FromEnrollmentStatus { get; set; }
        public string? ToEnrollmentStatus { get; set; }
        public string? FromPaymentStatus { get; set; }
        public string? ToPaymentStatus { get; set; }
        public string? FromAccountStatus { get; set; }
        public string? ToAccountStatus { get; set; }
        public string? Reason { get; set; }
        public string Actor { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    // ==========================================================
    // PASSWORD SETUP (public)
    // ==========================================================

    public class PasswordSetupTokenDto
    {
        public string Token { get; set; } = string.Empty;
    }

    public class CompletePasswordSetupDto
    {
        public string Token { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class PasswordSetupInfoDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string MaskedEmail { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }

    // ==========================================================
    // ORGANIZATION UPI SETTINGS
    // ==========================================================

    public class OrganizationPaymentSettingsDto
    {
        /// <summary>OrganizationPaymentSettings.Id (0 until settings are saved).</summary>
        public int Id { get; set; }
        public int OrganizationId { get; set; }
        public string? UpiId { get; set; }
        public string? UpiPayeeName { get; set; }
        public string? PayeeName => UpiPayeeName;
        public bool IsActive { get; set; }

        /// <summary>Authorized path for the QR image (needs the same login), or null.</summary>
        public string? QrCodeUrl => HasQrImage ? "/api/v1/organization/payment-settings/qr" : null;

        /// <summary>True when a UPI ID is saved (POST then returns 409; use PUT).</summary>
        public bool IsConfigured { get; set; }
        public bool HasQrImage { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class UpdateOrganizationPaymentSettingsDto
    {
        public string? UpiId { get; set; }
        public string? UpiPayeeName { get; set; }

        /// <summary>Requirement-document name for <see cref="UpiPayeeName"/>.</summary>
        public string? PayeeName { get; set; }

        /// <summary>Optional; unchanged when omitted.</summary>
        public bool? IsActive { get; set; }

        public string? EffectivePayeeName => string.IsNullOrWhiteSpace(UpiPayeeName) ? PayeeName : UpiPayeeName;
    }

    /// <summary>Multipart form version (Frontend 17): the same fields plus an optional QR image.</summary>
    public class OrganizationPaymentSettingsFormDto : UpdateOrganizationPaymentSettingsDto
    {
        public IFormFile? QrCodeImage { get; set; }
    }
}
