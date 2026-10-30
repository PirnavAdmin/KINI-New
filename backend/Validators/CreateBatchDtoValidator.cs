using FluentValidation;
using TalentSphereAPI.DTOs.Batch;

namespace TalentSphereAPI.Validators.Batch
{
    public class CreateBatchDtoValidator : AbstractValidator<CreateBatchDto>
    {
        public CreateBatchDtoValidator()
        {
            RuleFor(x => x.BatchName)
                .NotEmpty().WithMessage("Batch Name is required.")
                .MaximumLength(150);

            RuleFor(x => x.CourseId)
                .GreaterThan(0).WithMessage("Course is required.");

            RuleFor(x => x.MentorId)
                .GreaterThan(0).WithMessage("Mentor is required.");

            RuleFor(x => x.Capacity)
                .GreaterThan(0)
                .WithMessage("Capacity must be greater than 0.");

            RuleFor(x => x.StartDate)
                .NotEmpty();

            RuleFor(x => x.EndDate)
                .GreaterThan(x => x.StartDate)
                .WithMessage("End Date must be greater than Start Date.");

            RuleFor(x => x.Description)
                .MaximumLength(500);

            RuleFor(x => x.BatchType)
                .IsInEnum();

            RuleFor(x => x.Status)
                .IsInEnum();
        }
    }
}