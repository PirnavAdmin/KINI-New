using FluentValidation;

using TalentSphereAPI.DTOs;

namespace TalentSphereAPI.Validators.Auth

{

    public class ForgotPasswordValidator : AbstractValidator<ForgotPasswordDto>

    {

        public ForgotPasswordValidator()

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

        }

    }

}
