using FluentValidation;
using TalentSphereAPI.DTOs.EmployeeAttendance;

namespace TalentSphereAPI.Validators.EmployeeAttendance
{
    public class CheckInDtoValidator : AbstractValidator<CheckInDto>
    {
        public CheckInDtoValidator()
        {
            RuleFor(x => x.Remarks)
                .MaximumLength(500)
                .When(x => !string.IsNullOrWhiteSpace(x.Remarks));
        }
    }
}