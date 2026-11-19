namespace TalentSphereAPI.Enums
{
    // Stored as strings (HasConversion<string>) so rows stay readable in MySQL.

    /// <summary>Lifecycle of a public (guest) enrollment application.</summary>
    public enum EnrollmentApplicationStatus
    {
        PendingPayment,     // created, proof waiting for verification, or proof rejected -> resubmit
        PendingApproval,    // payment verified, waiting for enrollment approval
        Approved,           // organization approved; account provisioned
        Rejected,           // organization rejected the enrollment (terminal)
        Cancelled           // withdrawn before approval (terminal; reserved, no API sets it yet)
    }

    /// <summary>Payment state of an application, and of each individual proof attempt.</summary>
    public enum EnrollmentPaymentStatus
    {
        NotSubmitted,
        PendingVerification, // proof uploaded, waiting for the organization to check its bank credit
        Verified,
        Rejected
    }

    /// <summary>State of the student account linked to an application.</summary>
    public enum EnrollmentAccountStatus
    {
        NotCreated,
        PendingSetup,        // account exists, waiting for the student to set a password
        Active,              // password set (or existing account linked)
        ProvisioningFailed   // approval committed but provisioning needs a retry
    }

    public enum PasswordSetupTokenPurpose
    {
        InitialSetup,
        // Issued by verify-otp after a forgot-password code; used once by reset-password.
        PasswordReset
    }
}
