using FluentValidation;
using TalentSphereAPI.DTOs.Batch;

namespace TalentSphereAPI.Validators.Batch
{
    public class UpdateBatchDtoValidator : AbstractValidator<UpdateBatchDto>
    {
        public UpdateBatchDtoValidator()
        {
            RuleFor(x => x.BatchName)
                .NotEmpty().WithMessage("Batch Name is required.")
                .MaximumLength(150);

            RuleFor(x => x.CourseId)
                .GreaterThan(0);

            RuleFor(x => x.MentorId)
                .GreaterThan(0);

            RuleFor(x => x.Capacity)
                .GreaterThan(0);

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