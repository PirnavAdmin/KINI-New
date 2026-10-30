using FluentValidation;
using TalentSphereAPI.DTOs.Invoice;

namespace TalentSphereAPI.Validators.Invoice
{
    public class CreateInvoiceValidator
        : AbstractValidator<CreateInvoiceDto>
    {
        public CreateInvoiceValidator()
        {
            RuleFor(x => x.StudentId)
                .GreaterThan(0)
                .WithMessage(
                    "StudentId must be greater than zero.");

            RuleFor(x => x.CourseId)
                .GreaterThan(0)
                .WithMessage(
                    "CourseId must be greater than zero.");

            RuleFor(x => x.SubTotal)
                .GreaterThan(0)
                .LessThanOrEqualTo(10000000)
                .WithMessage(
                    "SubTotal must be between 0.01 and 10,000,000.");

            RuleFor(x => x.DiscountAmount)
                .GreaterThanOrEqualTo(0)
                .WithMessage(
                    "DiscountAmount cannot be negative.");

            RuleFor(x => x)
                .Must(x =>
                    x.DiscountAmount <= x.SubTotal)
                .WithMessage(
                    "DiscountAmount cannot be greater than SubTotal.");

            RuleFor(x => x.TaxPercentage)
                .InclusiveBetween(0, 100)
                .WithMessage(
                    "TaxPercentage must be between 0 and 100.");

            RuleFor(x => x.DueDate)
                .Must(date =>
                    date.Date >= DateTime.UtcNow.Date)
                .WithMessage(
                    "DueDate cannot be in the past.");

            RuleFor(x => x.Notes)
                .MaximumLength(1000)
                .WithMessage(
                    "Notes cannot exceed 1000 characters.");
        }
    }
}