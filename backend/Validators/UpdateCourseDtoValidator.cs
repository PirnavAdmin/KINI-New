using FluentValidation;
using TalentSphereAPI.DTOs.Course;

namespace TalentSphereAPI.Validators
{
    public class UpdateCourseDtoValidator : AbstractValidator<UpdateCourseDto>
    {
        public UpdateCourseDtoValidator()
        {
            RuleFor(x => x.CourseName)
                .NotEmpty()
                .MaximumLength(200);

            RuleFor(x => x.Duration)
                .NotEmpty()
                .MaximumLength(50);

           

            

            RuleFor(x => x.Level)
                .NotEmpty()
                .Must(x => new[]
                {
                    "Beginner",
                    "Intermediate",
                    "Advanced"
                }.Contains(x));

            RuleFor(x => x.Price)
                .GreaterThanOrEqualTo(0);
        }
    }
}