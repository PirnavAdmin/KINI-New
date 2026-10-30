using FluentValidation;
using TalentSphereAPI.DTOs.Student;

namespace TalentSphereAPI.Validators
{
    public class CreateStudentDtoValidator : AbstractValidator<CreateStudentDto>
    {
        public CreateStudentDtoValidator()
        {
            RuleFor(x => x.FirstName)
                .Cascade(CascadeMode.Stop)
                .NotEmpty()
                .WithMessage("First name is required.")
                .Must(x => !string.IsNullOrWhiteSpace(x))
                .WithMessage("First name cannot contain only whitespace.")
                .Length(2, 50)
                .WithMessage("First name must be between 2 and 50 characters.")
                .Matches(@"^[A-Za-z\s'-]+$")
                .WithMessage(
                    "First name can contain only letters, spaces, apostrophes, and hyphens.");

            RuleFor(x => x.LastName)
                .Cascade(CascadeMode.Stop)
                .NotEmpty()
                .WithMessage("Last name is required.")
                .Must(x => !string.IsNullOrWhiteSpace(x))
                .WithMessage("Last name cannot contain only whitespace.")
                .Length(2, 50)
                .WithMessage("Last name must be between 2 and 50 characters.")
                .Matches(@"^[A-Za-z\s'-]+$")
                .WithMessage(
                    "Last name can contain only letters, spaces, apostrophes, and hyphens.");

            RuleFor(x => x.CourseId)
                .GreaterThan(0)
                .WithMessage("Please select a course.");

            RuleFor(x => x.BatchId)
                .GreaterThan(0)
                .WithMessage("Please select a batch.");

            RuleFor(x => x.Email)
                .Cascade(CascadeMode.Stop)
                .NotEmpty()
                .WithMessage("Email is required.")
                .MaximumLength(100)
                .WithMessage("Email cannot exceed 100 characters.")
                .EmailAddress()
                .WithMessage("Please enter a valid email address.");

            RuleFor(x => x.Phone)
                .Cascade(CascadeMode.Stop)
                .NotEmpty()
                .WithMessage("Phone number is required.")
                .Matches(@"^[6-9]\d{9}$")
                .WithMessage(
                    "Phone number must be a valid 10-digit Indian mobile number.");
        }
    }
}