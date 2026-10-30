using FluentValidation;

using TalentSphereAPI.DTOs.LiveClass;

namespace TalentSphereAPI.Validators.LiveClass

{

    public class UploadLiveClassPdfDtoValidator

        : AbstractValidator<UploadLiveClassPdfDto>

    {

        public UploadLiveClassPdfDtoValidator()

        {

            RuleFor(x => x.LiveClassId)

                .GreaterThan(0);

            RuleFor(x => x.PdfFile)

                .NotNull()

                .WithMessage("PDF is required.");

            RuleFor(x => x.PdfFile.Length)

                .LessThanOrEqualTo(20 * 1024 * 1024)

                .WithMessage("Maximum file size is 20 MB.");

            RuleFor(x => x.PdfFile.FileName)

                .Must(name => Path.GetExtension(name)

                .Equals(".pdf", StringComparison.OrdinalIgnoreCase))

                .WithMessage("Only PDF files are allowed.");

        }

    }

}
