using FluentValidation;

using TalentSphereAPI.DTOs.Notification;

namespace TalentSphereAPI.Validators.Notification

{

    public class MarkNotificationReadDtoValidator : AbstractValidator<MarkNotificationReadDto>

    {

        public MarkNotificationReadDtoValidator()

        {

            RuleFor(x => x.NotificationId)

                .GreaterThan(0)

                .WithMessage("Notification Id must be greater than 0.");

        }

    }

}
