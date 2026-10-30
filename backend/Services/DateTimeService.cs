namespace TalentSphereAPI.Services;

public interface IDateTimeService
{
    DateTime Now();
    DateOnly Today();
    DateTime UtcNow();
    DateTime ToUtc(DateTime dateTime);
}

public class DateTimeService : IDateTimeService
{
    private readonly TimeZoneInfo _indiaTimeZone;

    public DateTimeService()
    {
        try
        {
            // Windows
            _indiaTimeZone =
                TimeZoneInfo.FindSystemTimeZoneById(
                    "India Standard Time");
        }
        catch
        {
            // Linux / Docker
            _indiaTimeZone =
                TimeZoneInfo.FindSystemTimeZoneById(
                    "Asia/Kolkata");
        }
    }

    // =========================================================
    // CURRENT INDIA DATE + TIME
    // =========================================================

    public DateTime Now()
    {
        return TimeZoneInfo.ConvertTimeFromUtc(
            DateTime.UtcNow,
            _indiaTimeZone);
    }

    // =========================================================
    // CURRENT INDIA DATE
    // =========================================================

    public DateOnly Today()
    {
        return DateOnly.FromDateTime(
            Now());
    }

    // =========================================================
    // CURRENT UTC DATE + TIME
    // =========================================================

    public DateTime UtcNow()
    {
        return DateTime.UtcNow;
    }

    // =========================================================
    // CONVERT DATE/TIME TO UTC
    // =========================================================

    public DateTime ToUtc(DateTime dateTime)
    {
        // -----------------------------------------------------
        // Already UTC
        // -----------------------------------------------------

        if (dateTime.Kind == DateTimeKind.Utc)
        {
            return dateTime;
        }

        // -----------------------------------------------------
        // Explicit Local DateTime
        // -----------------------------------------------------

        if (dateTime.Kind == DateTimeKind.Local)
        {
            return dateTime.ToUniversalTime();
        }

        // -----------------------------------------------------
        // Swagger usually sends:
        //
        // 2026-10-07T12:00:00
        //
        // This arrives as DateTimeKind.Unspecified.
        //
        // Treat unspecified values as IST.
        // -----------------------------------------------------

        var indiaDateTime =
            DateTime.SpecifyKind(
                dateTime,
                DateTimeKind.Unspecified);

        return TimeZoneInfo.ConvertTimeToUtc(
            indiaDateTime,
            _indiaTimeZone);
    }
}