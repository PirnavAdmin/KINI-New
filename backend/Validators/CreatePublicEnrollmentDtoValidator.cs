using FluentValidation;
using FluentValidation.Results;
using TalentSphereAPI.DTOs.PublicEnrollment;

namespace TalentSphereAPI.Validators
{
    public class CreatePublicEnrollmentDtoValidator
        : AbstractValidator<CreatePublicEnrollmentDto>
    {
        // Letters (any script), spaces, dot, apostrophe, hyphen.
        private const string NamePattern = @"^[\p{L}][\p{L}\s.'-]*$";

        // Indian mobile, optional +91 / 0 prefix.
        public const string PhonePattern = @"^(?:\+?91[\s-]?|0)?[6-9]\d{9}$";

        /// <summary>Accept the nested studentDetails shape by copying it into the flat fields first.</summary>
        protected override bool PreValidate(ValidationContext<CreatePublicEnrollmentDto> context, ValidationResult result)
        {
            context.InstanceToValidate?.ApplyStudentDetails();
            return true;
        }

        public CreatePublicEnrollmentDtoValidator()
        {
            RuleFor(x => x.CourseId)
                .GreaterThan(0).WithMessage("Please select a course.");

            RuleFor(x => x.BatchId)
                .GreaterThan(0).When(x => x.BatchId.HasValue)
                .WithMessage("Please select a valid batch.");

            RuleFor(x => x.FirstName)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("First name is required.")
                .MaximumLength(100)
                .Matches(NamePattern).WithMessage("First name can only contain letters, spaces, dots, apostrophes and hyphens.");

            // Optional so a single-word studentDetails.fullName is accepted.
            RuleFor(x => x.LastName)
                .Cascade(CascadeMode.Stop)
                .MaximumLength(100)
                .Matches(NamePattern).WithMessage("Last name can only contain letters, spaces, dots, apostrophes and hyphens.")
                .When(x => !string.IsNullOrWhiteSpace(x.LastName));

            RuleFor(x => x.Email)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Email is required.")
                .MaximumLength(255)
                .EmailAddress().WithMessage("Enter a valid email address.");

            RuleFor(x => x.Phone)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Phone number is required.")
                .Matches(PhonePattern).WithMessage("Enter a valid 10-digit Indian mobile number.");

            RuleFor(x => x.HighestQualification)
                .NotEmpty().WithMessage("Highest qualification is required.")
                .MaximumLength(100);

            RuleFor(x => x.InstitutionName)
                .MaximumLength(200);

            RuleFor(x => x.Address)
                .MaximumLength(500);

            RuleFor(x => x.YearOfPassing)
                .InclusiveBetween(1950, DateTime.UtcNow.Year + 6)
                .When(x => x.YearOfPassing.HasValue)
                .WithMessage("Enter a valid year of passing.");
        }
    }

    public class RequestEnrollmentAccessLinkDtoValidator
        : AbstractValidator<RequestEnrollmentAccessLinkDto>
    {
        public RequestEnrollmentAccessLinkDtoValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(255);
            RuleFor(x => x.EnrollmentNumber).NotEmpty().MaximumLength(32);
        }
    }
}
