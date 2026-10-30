using FluentValidation;
using TalentSphereAPI.DTOs.LiveClass;

namespace TalentSphereAPI.Validators.LiveClass
{
    public class CreateLiveClassDtoValidator
        : AbstractValidator<CreateLiveClassDto>
    {
        public CreateLiveClassDtoValidator()
        {
            RuleFor(x => x.ClassTitle)
                .NotEmpty()
                .MaximumLength(200);

            RuleFor(x => x.CourseId)
                .GreaterThan(0);

            RuleFor(x => x.BatchId)
                .GreaterThan(0);

            RuleFor(x => x.ScheduledDate)
                .NotEmpty();

            RuleFor(x => x.StartTime)
                .NotEmpty();

            RuleFor(x => x.EndTime)
                .NotEmpty();

            RuleFor(x => x.EndTime)
                .GreaterThan(x => x.StartTime)
                .WithMessage(
                    "End Time must be greater than Start Time.");

            RuleFor(x => x.MeetingPlatform)
                .NotEmpty()
                .Must(IsSupportedPlatform)
                .WithMessage(
                    "Meeting Platform must be Zoom, Google Meet, or Jitsi.");

            // =====================================================
            // ZOOM
            // =====================================================

            When(
                x => x.MeetingPlatform.Equals(
                    "Zoom",
                    StringComparison.OrdinalIgnoreCase),
                () =>
                {
                    RuleFor(x => x.MeetingLink)
                        .NotEmpty()
                        .WithMessage(
                            "Meeting Link is required for Zoom.");

                    RuleFor(x => x.MeetingLink)
                        .Must(IsValidUrl)
                        .When(x =>
                            !string.IsNullOrWhiteSpace(
                                x.MeetingLink))
                        .WithMessage(
                            "Meeting Link must be a valid URL.");
                });

            // =====================================================
            // GOOGLE MEET
            // =====================================================

            When(
                x => x.MeetingPlatform.Equals(
                    "Google Meet",
                    StringComparison.OrdinalIgnoreCase),
                () =>
                {
                    RuleFor(x => x.MeetingLink)
                        .NotEmpty()
                        .WithMessage(
                            "Meeting Link is required for Google Meet.");

                    RuleFor(x => x.MeetingLink)
                        .Must(IsValidUrl)
                        .When(x =>
                            !string.IsNullOrWhiteSpace(
                                x.MeetingLink))
                        .WithMessage(
                            "Meeting Link must be a valid URL.");
                });

            // =====================================================
            // JITSI
            // =====================================================
            //
            // No MeetingLink required.
            //
            // The backend generates it.
            //
        }

        private static bool IsSupportedPlatform(
            string? platform)
        {
            if (string.IsNullOrWhiteSpace(platform))
                return false;

            return
                platform.Equals(
                    "Zoom",
                    StringComparison.OrdinalIgnoreCase)
                ||
                platform.Equals(
                    "Google Meet",
                    StringComparison.OrdinalIgnoreCase)
                ||
                platform.Equals(
                    "Jitsi",
                    StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsValidUrl(
            string? value)
        {
            return Uri.TryCreate(
                value,
                UriKind.Absolute,
                out var uri)
                &&
                (
                    uri.Scheme ==
                        Uri.UriSchemeHttp
                    ||
                    uri.Scheme ==
                        Uri.UriSchemeHttps
                );
        }
    }
}