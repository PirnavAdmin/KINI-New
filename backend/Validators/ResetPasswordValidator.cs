using FluentValidation;
using TalentSphereAPI.DTOs;

namespace TalentSphereAPI.Validators
{
    public class ResetPasswordValidator : AbstractValidator<ResetPasswordDto>
    {
        public ResetPasswordValidator()
        {
            RuleFor(x => x.Identifier)
                .NotEmpty()
                .WithMessage("Email or Phone is required.");

            RuleFor(x => x.OtpType)
                .NotEmpty()
                .Must(x =>
                    x.Equals("Email", StringComparison.OrdinalIgnoreCase) ||
                    x.Equals("Mobile", StringComparison.OrdinalIgnoreCase))
                .WithMessage("OTP Type must be Email or Mobile.");

            RuleFor(x => x.Otp)
                .NotEmpty()
                .Length(6)
                .WithMessage("OTP must be 6 digits.");

            RuleFor(x => x.NewPassword)
                .NotEmpty()
                .MinimumLength(8)
                .Matches(@"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).+$")
                .WithMessage("Password must contain uppercase, lowercase, number, and special character.");

            RuleFor(x => x.ConfirmPassword)
                .Equal(x => x.NewPassword)
                .WithMessage("Confirm Password must match New Password.");
        }
    }
}
