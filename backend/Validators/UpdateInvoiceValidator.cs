using FluentValidation;
using TalentSphereAPI.DTOs.Invoice;

namespace TalentSphereAPI.Validators.Invoice
{
    public class UpdateInvoiceValidator
        : AbstractValidator<UpdateInvoiceDto>
    {
        public UpdateInvoiceValidator()
        {
            RuleFor(x => x.SubTotal)
                .GreaterThan(0)
                .LessThanOrEqualTo(10000000);

            RuleFor(x => x.DiscountAmount)
                .GreaterThanOrEqualTo(0);

            RuleFor(x => x)
                .Must(x =>
                    x.DiscountAmount <= x.SubTotal)
                .WithMessage(
                    "DiscountAmount cannot be greater than SubTotal.");

            RuleFor(x => x.TaxPercentage)
                .InclusiveBetween(0, 100);

            RuleFor(x => x.Currency)
                .NotEmpty()
                .Length(3)
                .Matches("^[A-Za-z]{3}$")
                .WithMessage(
                    "Currency must be a 3-letter ISO currency code.");

            RuleFor(x => x.BillingAddress)
                .MaximumLength(1000);

            RuleFor(x => x.PlaceOfSupply)
                .MaximumLength(100);

            RuleFor(x => x.DueDate)
                .Must(date =>
                    date.Date >= DateTime.UtcNow.Date)
                .WithMessage(
                    "DueDate cannot be in the past.");

            RuleFor(x => x.Notes)
                .MaximumLength(1000);
        }
    }
}