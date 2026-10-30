using FluentValidation;

using TalentSphereAPI.DTOs.Department;

namespace TalentSphereAPI.Validators

{

    public class UpdateDepartmentDtoValidator

        : AbstractValidator<UpdateDepartmentDto>

    {

        public UpdateDepartmentDtoValidator()

        {

           // RuleFor(x => x.OrganizationId)

            //    .GreaterThan(0);

            RuleFor(x => x.Name)

                .NotEmpty()

                .MaximumLength(150);

            RuleFor(x => x.Description)

                .NotEmpty()

                .MaximumLength(500);

            RuleFor(x => x.ManagerId)

                .GreaterThan(0)

                .When(x => x.ManagerId.HasValue);

        }

    }

}
