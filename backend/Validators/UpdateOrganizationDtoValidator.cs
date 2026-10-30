using FluentValidation;

using TalentSphereAPI.DTOs.Organization;

namespace TalentSphereAPI.Validators

{

    public class UpdateOrganizationDtoValidator

        : AbstractValidator<UpdateOrganizationDto>

    {

        public UpdateOrganizationDtoValidator()

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

                .NotEmpty();

            RuleFor(x => x.Country)

                .NotEmpty();

            RuleFor(x => x.Website)

                .NotEmpty()

                .Must(uri =>

                {

                    return Uri.TryCreate(

                        uri,

                        UriKind.Absolute,

                        out _);

                });

        }

    }

}
