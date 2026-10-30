using FluentValidation;
using TalentSphereAPI.DTOs.Mentor;

namespace TalentSphereAPI.Validators.Mentor
{
    public class UpdateMentorDtoValidator
        : AbstractValidator<UpdateMentorDto>
    {
        public UpdateMentorDtoValidator()
        {
            RuleFor(x => x.FirstName).NotEmpty();

            RuleFor(x => x.LastName).NotEmpty();

            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress();

            RuleFor(x => x.Phone)
                .NotEmpty();

            RuleFor(x => x.CourseIds)
                .NotEmpty();
        }
    }
}