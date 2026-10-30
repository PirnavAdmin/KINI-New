using FluentValidation;

using TalentSphereAPI.DTOs.Team;

namespace TalentSphereAPI.Validators

{

    public class CreateTeamDtoValidator : AbstractValidator<CreateTeamDto>

    {

        public CreateTeamDtoValidator()

        {

            RuleFor(x => x.Name)

                .NotEmpty()

                .MaximumLength(150);

            RuleFor(x => x.DepartmentId)

                .GreaterThan(0);

            RuleFor(x => x.ManagerId)

                .GreaterThan(0)

                .When(x => x.ManagerId.HasValue);

        }

    }

}
