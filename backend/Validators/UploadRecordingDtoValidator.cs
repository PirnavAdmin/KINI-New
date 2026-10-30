using FluentValidation;

using TalentSphereAPI.DTOs.LiveClass;

namespace TalentSphereAPI.Validators.LiveClass

{

    public class UploadRecordingDtoValidator

        : AbstractValidator<UploadRecordingDto>

    {

        public UploadRecordingDtoValidator()

        {

            RuleFor(x => x.LiveClassId)

                .GreaterThan(0);

            RuleFor(x => x.Recording)

                .NotNull()

                .WithMessage("Recording file is required.");

            RuleFor(x => x.Recording.Length)

                .LessThanOrEqualTo(1024L * 1024 * 1024)

                .WithMessage("Maximum recording size is 1 GB.");

            RuleFor(x => x.Recording.FileName)

                .Must(file =>

                {

                    var ext = Path.GetExtension(file)

                        .ToLower();

                    return ext == ".mp4"

                        || ext == ".avi"

                        || ext == ".mov"

                        || ext == ".mkv";

                })

                .WithMessage("Only MP4, AVI, MOV and MKV are allowed.");

        }

    }

}
