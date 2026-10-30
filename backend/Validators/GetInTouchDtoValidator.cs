using FluentValidation;
using TalentSphereAPI.DTOs;

namespace TalentSphereAPI.Validators
{
    public class GetInTouchDtoValidator : AbstractValidator<GetInTouchDto>
    {
        public GetInTouchDtoValidator()
        {
            RuleFor(x => x.Name)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Name is required.")
                .MaximumLength(100).WithMessage("Name cannot exceed 100 characters.");

            RuleFor(x => x.Email)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Email is required.")
                .MaximumLength(254).WithMessage("Email cannot exceed 254 characters.")
                .EmailAddress().WithMessage("Enter a valid email address.");

            RuleFor(x => x.MobileNumber)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Mobile number is required.")
                .Matches(@"^[6-9]\d{9}$")
                .WithMessage("Enter a valid 10-digit Indian mobile number.");

            RuleFor(x => x.Subject)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Subject is required.")
                .MaximumLength(200).WithMessage("Subject cannot exceed 200 characters.");

            RuleFor(x => x.Message)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Message is required.")
                .MaximumLength(2000).WithMessage("Message cannot exceed 2000 characters.");
        }
    }
}

