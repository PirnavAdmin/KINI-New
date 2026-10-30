using FluentValidation;
using TalentSphereAPI.DTOs.Mentor;

namespace TalentSphereAPI.Validators
{
    public class CreateMentorDtoValidator : AbstractValidator<CreateMentorDto>
    {
        public CreateMentorDtoValidator()
        {
            RuleFor(x => x.FirstName)
                .NotEmpty()
                .WithMessage("First name is required.");

            RuleFor(x => x.LastName)
                .NotEmpty()
                .WithMessage("Last name is required.");

            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress()
                .WithMessage("Valid email is required.");

            RuleFor(x => x.Phone)
                .NotEmpty()
                .WithMessage("Phone number is required.");


            RuleFor(x => x.Status)
                .NotNull()
                .WithMessage("Status is required.");
        }
    }
}