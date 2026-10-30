using FluentValidation;
using TalentSphereAPI.DTOs;

namespace TalentSphereAPI.Validators
{
    public class SendOtpDtoValidator : AbstractValidator<SendOtpDto>
    {
        public SendOtpDtoValidator()
        {
            RuleFor(x => x.Identifier)
                .NotEmpty()
                .WithMessage("Identifier is required.");

            RuleFor(x => x.OtpType)
                .Cascade(CascadeMode.Stop)
                .NotEmpty()
                .WithMessage("OtpType is required.")
                .Must(BeValidOtpType)
                .WithMessage("OtpType must be Email or Mobile.");
        }

        private bool BeValidOtpType(string? otpType)
        {
            if (string.IsNullOrWhiteSpace(otpType))
                return false;

            otpType = otpType.Trim();

            return otpType.Equals("Email", StringComparison.OrdinalIgnoreCase) ||
                   otpType.Equals("Mobile", StringComparison.OrdinalIgnoreCase);
        }
    }
}