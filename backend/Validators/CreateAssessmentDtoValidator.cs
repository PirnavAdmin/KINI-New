using FluentValidation;
using TalentSphereAPI.DTOs.Assessment;

namespace TalentSphereAPI.Validators
{
    public class CreateAssessmentDtoValidator
        : AbstractValidator<CreateAssessmentDto>
    {
        public CreateAssessmentDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty()
                .WithMessage("Assessment title is required.")
                .MaximumLength(200)
                .WithMessage("Assessment title cannot exceed 200 characters.");

            RuleFor(x => x.CourseId)
                .GreaterThan(0)
                .WithMessage("Course is required.");

            RuleFor(x => x.BatchId)
                .GreaterThan(0)
                .WithMessage("Batch is required.");

            RuleFor(x => x.TotalMarks)
                .GreaterThan(0)
                .WithMessage("Total marks must be greater than zero.");

            RuleFor(x => x.PassingMarks)
                .GreaterThan(0)
                .WithMessage("Passing marks must be greater than zero.")
                .LessThanOrEqualTo(x => x.TotalMarks)
                .WithMessage("Passing marks cannot be greater than total marks.");

            RuleFor(x => x.DurationMinutes)
                .GreaterThan(0)
                .WithMessage("Duration must be greater than zero.");

            RuleFor(x => x.AssessmentType)
                .NotEmpty()
                .Must(type =>
                    type.Equals("MCQ", StringComparison.OrdinalIgnoreCase) ||
                    type.Equals("Coding", StringComparison.OrdinalIgnoreCase) ||
                    type.Equals("Mixed", StringComparison.OrdinalIgnoreCase))
                .WithMessage("Assessment type must be MCQ, Coding, or Mixed.");

            RuleFor(x => x.EndDate)
                .GreaterThan(x => x.StartDate)
                .WithMessage("End date must be after start date.");
        }
    }
}