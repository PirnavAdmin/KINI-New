using FluentValidation;

using TalentSphereAPI.DTOs;

namespace TalentSphereAPI.Validators.Auth

{

    public class LoginValidator : AbstractValidator<LoginDto>

    {

        public LoginValidator()

        {

            RuleFor(x => x.Identifier)
    .NotEmpty()
    .WithMessage("Email or Phone is required.")


                .EmailAddress().WithMessage("Invalid email format.");

            RuleFor(x => x.Password)
                .Cascade(CascadeMode.Stop)
                .NotEmpty()
                    .WithMessage("Password is required.")
                .MinimumLength(8)
                    .WithMessage("Password must be at least 8 characters long.")
                .MaximumLength(100)
                    .WithMessage("Password cannot exceed 100 characters.");

           
            RuleFor(x => x.RememberMe)
                .NotNull()
                    .WithMessage("RememberMe value is required.");

        }

    }

}
