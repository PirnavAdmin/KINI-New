using TalentSphereAPI.Data;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services
{
    /// <summary>
    /// Error with an HTTP status and a stable machine-readable code, mapped by
    /// the public/organization enrollment controllers. Messages are safe to
    /// show to the end user.
    /// </summary>
    public class EnrollmentWorkflowException : Exception
    {
        public int StatusCode { get; }
        public string Code { get; }

        public EnrollmentWorkflowException(int statusCode, string code, string message)
            : base(message)
        {
            StatusCode = statusCode;
            Code = code;
        }
    }

    /// <summary>Applies status transitions and records them in EnrollmentApprovalHistory.</summary>
    public static class EnrollmentWorkflow
    {
        public static void Transition(
            ApplicationDbContext context,
            CourseEnrollment application,
            string action,
            string actor,
            EnrollmentApplicationStatus? enrollmentStatus = null,
            EnrollmentPaymentStatus? paymentStatus = null,
            EnrollmentAccountStatus? accountStatus = null,
            string? reason = null,
            int? actorUserId = null)
        {
            var history = new EnrollmentApprovalHistory
            {
                CourseEnrollment = application,
                Action = action,
                Actor = actor,
                ActionByUserId = actorUserId,
                Reason = reason,
                FromStatus = StatusSnapshot(application),
                CreatedAt = DateTime.UtcNow
            };

            if (enrollmentStatus.HasValue) application.EnrollmentStatus = enrollmentStatus.Value;
            if (paymentStatus.HasValue) application.PaymentStatus = paymentStatus.Value;
            if (accountStatus.HasValue) application.AccountStatus = accountStatus.Value;

            history.ToStatus = StatusSnapshot(application);

            application.UpdatedAt = DateTime.UtcNow;
            application.ConcurrencyStamp = Guid.NewGuid().ToString();

            context.EnrollmentApprovalHistories.Add(history);
        }

        /// <summary>History FromStatus/ToStatus format: "EnrollmentStatus|PaymentStatus|AccountStatus".</summary>
        public static string StatusSnapshot(CourseEnrollment application) =>
            $"{application.EnrollmentStatus}|{application.PaymentStatus}|{application.AccountStatus}";

        /// <summary>Splits a StatusSnapshot back into its three parts (nulls when absent).</summary>
        public static (string? Enrollment, string? Payment, string? Account) ParseSnapshot(string? value)
        {
            var parts = (value ?? string.Empty).Split('|');
            string? At(int i) => parts.Length > i && parts[i].Length > 0 ? parts[i] : null;
            return (At(0), At(1), At(2));
        }

        /// <summary>Student-facing stage used by the public status screen.</summary>
        public static string Stage(CourseEnrollment application) =>
            application.EnrollmentStatus switch
            {
                EnrollmentApplicationStatus.Rejected => "EnrollmentRejected",
                EnrollmentApplicationStatus.Cancelled => "Cancelled",
                EnrollmentApplicationStatus.Approved =>
                    application.AccountStatus == EnrollmentAccountStatus.Active
                        ? "AccountActive"
                        : "EnrollmentApproved",
                EnrollmentApplicationStatus.PendingApproval => "PaymentVerified",
                _ => application.PaymentStatus switch
                {
                    EnrollmentPaymentStatus.PendingVerification => "PaymentSubmitted",
                    EnrollmentPaymentStatus.Rejected => "PaymentRejected",
                    _ => "AwaitingPayment"
                }
            };

        /// <summary>What the student should do next (status API "nextAction").</summary>
        public static string NextAction(CourseEnrollment application) => Stage(application) switch
        {
            "AwaitingPayment" => "SubmitPayment",
            "PaymentRejected" => "ResubmitPayment",
            "PaymentSubmitted" => "WaitForVerification",
            "PaymentVerified" => "WaitForApproval",
            "EnrollmentApproved" => application.AccountStatus == EnrollmentAccountStatus.PendingSetup
                ? "SetPassword"
                : "ContactOrganization",
            "AccountActive" => "Login",
            _ => "ContactOrganization"
        };

        public static string StageMessage(string stage) => stage switch
        {
            "AwaitingPayment" => "Complete the UPI payment and upload your payment proof.",
            "PaymentSubmitted" => "Payment Submitted – Waiting for Organization Verification",
            "PaymentVerified" => "Payment Verified – Awaiting Enrollment Approval",
            "PaymentRejected" => "Your payment proof was rejected. Please check the reason and resubmit.",
            "EnrollmentApproved" => "Enrollment approved — check your email for the password setup link.",
            "AccountActive" => "Your account is active. Continue to student login.",
            "EnrollmentRejected" => "Your enrollment was not approved by the organization.",
            "Cancelled" => "This enrollment was cancelled.",
            _ => string.Empty
        };

        public static bool IsDuplicateKey(Exception ex) =>
            ex.InnerException is MySqlConnector.MySqlException { Number: 1062 };
    }
}
