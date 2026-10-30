using FluentValidation;
using TalentSphereAPI.DTOs.Organization;

namespace TalentSphereAPI.Validators
{
    public class LoginOrganizationDtoValidator : AbstractValidator<LoginOrganizationDto>
    {
        public LoginOrganizationDtoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress();

            RuleFor(x => x.Password)
                .NotEmpty();
        }
    }
}