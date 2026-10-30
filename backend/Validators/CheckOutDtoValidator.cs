using FluentValidation;
using TalentSphereAPI.DTOs.EmployeeAttendance;

namespace TalentSphereAPI.Validators.EmployeeAttendance
{
    public class CheckOutDtoValidator : AbstractValidator<CheckOutDto>
    {
        public CheckOutDtoValidator()
        {
            RuleFor(x => x.Remarks)
                .MaximumLength(500)
                .When(x => !string.IsNullOrWhiteSpace(x.Remarks));
        }
    }
}