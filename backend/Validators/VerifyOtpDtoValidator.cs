using FluentValidation;
using TalentSphereAPI.DTOs;

namespace TalentSphereAPI.Validators
{
    public class VerifyOtpDtoValidator : AbstractValidator<VerifyOtpDto>
    {
        public VerifyOtpDtoValidator()
        {
            RuleFor(x => x.OtpType)
                .Cascade(CascadeMode.Stop)
                .NotEmpty()
                    .WithMessage("OTP type is required.")
                .Must(x => x.Equals("Email", StringComparison.OrdinalIgnoreCase) ||
                           x.Equals("Mobile", StringComparison.OrdinalIgnoreCase))
                    .WithMessage("OTP type must be Email or Mobile.");

            RuleFor(x => x.Identifier)
                .Cascade(CascadeMode.Stop)
                .NotEmpty()
                    .WithMessage("Email or Phone number is required.");

            RuleFor(x => x.Identifier)
                .EmailAddress()
                .When(x => x.OtpType.Equals("Email", StringComparison.OrdinalIgnoreCase))
                .WithMessage("Please enter a valid email address.");

            RuleFor(x => x.Identifier)
                .Matches(@"^[6-9]\d{9}$")
                .When(x => x.OtpType.Equals("Mobile", StringComparison.OrdinalIgnoreCase))
                .WithMessage("Please enter a valid 10-digit Indian mobile number.");

            RuleFor(x => x.Otp)
                .Cascade(CascadeMode.Stop)
                .NotEmpty()
                    .WithMessage("OTP is required.")
                .Length(6)
                    .WithMessage("OTP must be exactly 6 digits.")
                .Matches(@"^\d{6}$")
                    .WithMessage("OTP must contain only numbers.");
        }
    }
}