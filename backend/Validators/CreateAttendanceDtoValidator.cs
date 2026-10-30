using FluentValidation;
using TalentSphereAPI.DTOs.Attendance;

namespace TalentSphereAPI.Validators.Attendance
{
    public class CreateAttendanceDtoValidator
        : AbstractValidator<CreateAttendanceDto>
    {
        public CreateAttendanceDtoValidator()
        {
            RuleFor(x => x.StudentId)
                .GreaterThan(0);

            RuleFor(x => x.LiveClassId)
                .GreaterThan(0);

            RuleFor(x => x.Status)
                .IsInEnum();

            RuleFor(x => x.Remarks)
                .MaximumLength(500);
        }
    }
}