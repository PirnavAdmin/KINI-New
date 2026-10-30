using FluentValidation;
using TalentSphereAPI.DTOs.Attendance;

namespace TalentSphereAPI.Validators.Attendance
{
    public class UpdateAttendanceDtoValidator
        : AbstractValidator<UpdateAttendanceDto>
    {
        public UpdateAttendanceDtoValidator()
        {
            RuleFor(x => x.Status)
                .IsInEnum();

            RuleFor(x => x.Remarks)
                .MaximumLength(500);
        }
    }
}