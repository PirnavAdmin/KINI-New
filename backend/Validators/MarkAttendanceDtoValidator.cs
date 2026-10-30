using FluentValidation;

using TalentSphereAPI.DTOs.Attendance;

namespace TalentSphereAPI.Validators.Attendance

{

    public class MarkAttendanceDtoValidator

        : AbstractValidator<MarkAttendanceDto>

    {

        public MarkAttendanceDtoValidator()

        {

            RuleFor(x => x.StudentId)

                .GreaterThan(0);

            RuleFor(x => x.IsPresent)

                .NotNull();

        }

    }

}
