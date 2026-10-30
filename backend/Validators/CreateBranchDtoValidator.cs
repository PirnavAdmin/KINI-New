using FluentValidation;
using TalentSphereAPI.DTOs.Branches;

namespace TalentSphereAPI.Validators
{
    public class CreateBranchDtoValidator
        : AbstractValidator<CreateBranchDto>
    {
        public CreateBranchDtoValidator()
        {
            RuleFor(x => x.OrganizationId)
                .GreaterThan(0)
                .WithMessage("OrganizationId is required.");

            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Branch name is required.")
                .MaximumLength(200)
                .WithMessage(
                    "Branch name cannot exceed 200 characters.");

            RuleFor(x => x.Location)
                .MaximumLength(500)
                .When(x => x.Location != null)
                .WithMessage(
                    "Location cannot exceed 500 characters.");

            RuleFor(x => x.Description)
                .MaximumLength(1000)
                .When(x => x.Description != null)
                .WithMessage(
                    "Description cannot exceed 1000 characters.");
        }
    }
}