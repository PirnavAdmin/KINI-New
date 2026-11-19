using FluentValidation;
using TalentSphereAPI.DTOs.PublicEnrollment;

namespace TalentSphereAPI.Validators
{
    public class RejectWithReasonDtoValidator : AbstractValidator<RejectWithReasonDto>
    {
        public RejectWithReasonDtoValidator()
        {
            RuleFor(x => x.EffectiveReason)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("A rejection reason is required.")
                .Must(r => r.Trim().Length >= 5).WithMessage("Please give a clear reason (at least 5 characters).")
                .MaximumLength(500)
                .OverridePropertyName("reason");
        }
    }

    public class ApproveEnrollmentDtoValidator : AbstractValidator<ApproveEnrollmentDto>
    {
        public ApproveEnrollmentDtoValidator()
        {
            RuleFor(x => x.Remarks).MaximumLength(500);
        }
    }

    public class VerifyEnrollmentPaymentDtoValidator : AbstractValidator<VerifyEnrollmentPaymentDto>
    {
        public VerifyEnrollmentPaymentDtoValidator()
        {
            RuleFor(x => x.ConfirmBankTransactionChecked)
                .NotEqual(false)
                .WithMessage("Confirm that you matched this UTR and amount in your bank or UPI statement.");

            RuleFor(x => x.EffectiveNote).MaximumLength(500).OverridePropertyName("remarks");
        }
    }

    public class CompletePasswordSetupDtoValidator : AbstractValidator<CompletePasswordSetupDto>
    {
        public CompletePasswordSetupDtoValidator()
        {
            RuleFor(x => x.Token).NotEmpty().MaximumLength(100);

            // Same rule as the existing reset-password flow.
            RuleFor(x => x.Password)
                .NotEmpty()
                .MinimumLength(8)
                .MaximumLength(128)
                .Matches(@"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).+$")
                .WithMessage("Password must contain uppercase, lowercase, number, and special character.");

            RuleFor(x => x.ConfirmPassword)
                .Equal(x => x.Password)
                .WithMessage("Passwords do not match.");
        }
    }

    public class UpdateOrganizationPaymentSettingsDtoValidator : AbstractValidator<UpdateOrganizationPaymentSettingsDto>
    {
        public UpdateOrganizationPaymentSettingsDtoValidator()
        {
            RuleFor(x => x.UpiId)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("UPI ID is required.")
                .MaximumLength(100)
                .Matches(@"^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$")
                .WithMessage("Enter a valid UPI ID, e.g. yourname@okbank.");

            RuleFor(x => x.EffectivePayeeName)
                .MaximumLength(150)
                .OverridePropertyName("payeeName");
        }
    }

    /// <summary>Guest activation: same password policy as password setup / reset.</summary>
    public class GuestAccountActivationDtoValidator : AbstractValidator<GuestAccountActivationDto>
    {
        public GuestAccountActivationDtoValidator()
        {
            RuleFor(x => x.Token).NotEmpty().MaximumLength(100);

            RuleFor(x => x.Password)
                .NotEmpty()
                .MinimumLength(8)
                .MaximumLength(128)
                .Matches(@"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).+$")
                .WithMessage("Password must contain uppercase, lowercase, number, and special character.");
        }
    }

    /// <summary>Guest enrollment: terms must be accepted (field rules come from CreatePublicEnrollmentDtoValidator).</summary>
    public class GuestCreateEnrollmentDtoValidator : AbstractValidator<GuestCreateEnrollmentDto>
    {
        // Included rules don't run the included validator's PreValidate, so map
        // the nested studentDetails into the flat fields here as well.
        protected override bool PreValidate(ValidationContext<GuestCreateEnrollmentDto> context, FluentValidation.Results.ValidationResult result)
        {
            context.InstanceToValidate?.ApplyStudentDetails();
            return true;
        }

        public GuestCreateEnrollmentDtoValidator()
        {
            Include(new CreatePublicEnrollmentDtoValidator());
            RuleFor(x => x.AcceptedTerms).Equal(true).WithMessage("Please accept the terms to continue.");
        }
    }

    public class OrganizationPaymentSettingsFormDtoValidator : AbstractValidator<OrganizationPaymentSettingsFormDto>
    {
        public OrganizationPaymentSettingsFormDtoValidator()
        {
            Include(new UpdateOrganizationPaymentSettingsDtoValidator());
        }
    }
}
