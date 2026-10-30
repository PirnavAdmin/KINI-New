using FluentValidation;

using TalentSphereAPI.DTOs.SuperAdmin;

namespace TalentSphereAPI.Validators.SuperAdmin

{

    public class SuperAdminLoginValidator : AbstractValidator<SuperAdminLoginDto>

    {

        public SuperAdminLoginValidator()

        {

            RuleFor(x => x.Email)

                .NotEmpty()

                .EmailAddress();

            RuleFor(x => x.Password)

                .NotEmpty()

                .MinimumLength(6);

        }

    }

}
