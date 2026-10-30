using FluentValidation;
using TalentSphereAPI.DTOs.Employee;

namespace TalentSphereAPI.Validators.Employee
{
    public class CreateEmployeeDtoValidator
        : AbstractValidator<CreateEmployeeDto>
    {
        public CreateEmployeeDtoValidator()
        {
            RuleFor(x => x.FirstName)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(x => x.LastName)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress();

            RuleFor(x => x.Phone)
                .NotEmpty()
                .Matches(@"^[0-9]{10}$");

            RuleFor(x => x.Role)
                .NotEmpty()
                .MaximumLength(50);

            RuleFor(x => x.Status)
                .NotEmpty()
                .Must(x =>
                    x.Equals(
                        "Active",
                        StringComparison.OrdinalIgnoreCase)
                    ||
                    x.Equals(
                        "Inactive",
                        StringComparison.OrdinalIgnoreCase))
                .WithMessage(
                    "Status must be Active or Inactive");

            // Employee Type
            RuleFor(x => x.EmployeeType)
                .NotEmpty()
                .Must(x =>
                    x.Equals(
                        "Full-Time",
                        StringComparison.OrdinalIgnoreCase)
                    ||
                    x.Equals(
                        "Part-Time",
                        StringComparison.OrdinalIgnoreCase))
                .WithMessage(
                    "EmployeeType must be Full-Time or Part-Time");
        }
    }
}