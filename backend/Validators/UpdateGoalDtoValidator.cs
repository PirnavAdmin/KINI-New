using FluentValidation;

using TalentSphereAPI.DTOs.Goals;

namespace TalentSphereAPI.Validations.Goals

{

    public class UpdateGoalDtoValidator

        : AbstractValidator<UpdateGoalDto>

    {

        public UpdateGoalDtoValidator()

        {

            RuleFor(x => x.Title)

                .NotEmpty()

                .MaximumLength(200);

            RuleFor(x => x.OwnerId)

                .GreaterThan(0);

            RuleFor(x => x.Quarter)

                .NotEmpty()

                .MaximumLength(20);

            RuleFor(x => x.Status)

                .NotEmpty()

                .Must(x =>

                    x.ToLower() == "active" ||

                    x.ToLower() == "completed")

                .WithMessage(

                    "Status must be Active or Completed");

        }

    }

}
