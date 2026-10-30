using FluentValidation;
using TalentSphereAPI.DTOs.Attendance;

namespace TalentSphereAPI.Validators.Attendance
{
    public class BulkAttendanceDtoValidator
        : AbstractValidator<BulkAttendanceDto>
    {
        public BulkAttendanceDtoValidator()
        {
            RuleFor(x => x.LiveClassId)
                .GreaterThan(0);

            RuleFor(x => x.Students)
                .NotEmpty();

            RuleForEach(x => x.Students)
                .ChildRules(student =>
                {
                    student.RuleFor(x => x.StudentId)
                        .GreaterThan(0);

                    student.RuleFor(x => x.Status)
                        .IsInEnum();
                });
        }
    }
}