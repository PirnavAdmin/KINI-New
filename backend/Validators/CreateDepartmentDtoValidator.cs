using FluentValidation;

using TalentSphereAPI.DTOs.Department;

namespace TalentSphereAPI.Dtos.Validators

{

    public class CreateDepartmentDtoValidator

        : AbstractValidator<CreateDepartmentDto>

    {

        public CreateDepartmentDtoValidator()

        {

            RuleFor(x => x.Name)

                .NotEmpty()

                .MaximumLength(150);

            RuleFor(x => x.Description)

                .MaximumLength(500);

            RuleFor(x => x.ManagerId)

                .GreaterThan(0)

                .When(x => x.ManagerId.HasValue);

        }

    }

}
