using FluentValidation;

using TalentSphereAPI.DTOs.Organization;

namespace TalentSphereAPI.Validators

{

    public class CreateOrganizationDtoValidator

        : AbstractValidator<CreateOrganizationDto>

    {

        public CreateOrganizationDtoValidator()

        {

            RuleFor(x => x.OrganizationName)

                .NotEmpty()

                .MaximumLength(200);

            RuleFor(x => x.Email)

                .NotEmpty()

                .EmailAddress();

            RuleFor(x => x.Phone)

                .NotEmpty()

                .Matches(@"^[0-9]{10}$");

            RuleFor(x => x.Industry)

                .NotEmpty()

                .MaximumLength(100);

            RuleFor(x => x.Country)

                .NotEmpty()

                .MaximumLength(100);

            RuleFor(x => x.Website)

                .NotEmpty()

                .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))

                .WithMessage("Invalid website URL");
            RuleFor(x => x.Password)
    .NotEmpty()
    .MinimumLength(8)
    .WithMessage("Password must be at least 8 characters.");

            RuleFor(x => x.ConfirmPassword)
                .Equal(x => x.Password)
                .WithMessage("Passwords do not match.");
        }

    }

}
