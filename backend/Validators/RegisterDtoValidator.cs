using FluentValidation;
using TalentSphereAPI.DTOs;

namespace TalentSphereAPI.Validators
{
    public class RegisterDtoValidator
        : AbstractValidator<RegistrationDto>
    {
        public RegisterDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Name is required.")
                .MaximumLength(100);

            RuleFor(x => x.Email)
                .NotEmpty()
                .WithMessage("Email is required.")
                .EmailAddress()
                .MaximumLength(254);

            RuleFor(x => x.MobileNumber)
                .NotEmpty()
                .WithMessage("Mobile number is required.")
                .Matches(@"^[6-9]\d{9}$")
                .WithMessage("Enter a valid 10-digit Indian mobile number.");

            RuleFor(x => x.Qualification)
                .NotEmpty()
                .WithMessage("Qualification is required.")
                .MaximumLength(100);

            RuleFor(x => x.Program)
                .NotEmpty()
                .WithMessage("Program is required.")
                .MaximumLength(100);
        }
    }
}