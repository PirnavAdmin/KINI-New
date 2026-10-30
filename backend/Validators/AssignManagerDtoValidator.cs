using FluentValidation;

using TalentSphereAPI.DTOs.Team;

namespace TalentSphereAPI.Validators

{

    public class AssignManagerDtoValidator

        : AbstractValidator<TeamResponseDto>

    {

        public AssignManagerDtoValidator()

        {

            RuleFor(x => x.TeamId)

                .GreaterThan(0);

            RuleFor(x => x.ManagerId)

                .NotEmpty();

        }

    }

}
