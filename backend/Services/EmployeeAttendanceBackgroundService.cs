using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services
{
    public class EmployeeAttendanceBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        // 6:15 PM
        private static readonly TimeSpan LateCheckoutTime =
            new TimeSpan(18, 15, 0);

        public EmployeeAttendanceBackgroundService(
            IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessLateCheckoutsAsync(
                        stoppingToken);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(
                        $"Employee attendance background service error: {ex.Message}");
                }

                // Check every minute
                await Task.Delay(
                    TimeSpan.FromMinutes(1),
                    stoppingToken);
            }
        }

        private async Task ProcessLateCheckoutsAsync(
            CancellationToken cancellationToken)
        {
            using var scope =
                _scopeFactory.CreateScope();

            var context =
                scope.ServiceProvider
                    .GetRequiredService<ApplicationDbContext>();

            var dateTimeService =
                scope.ServiceProvider
                    .GetRequiredService<DateTimeService>();

            var now =
                dateTimeService.Now();

            // --------------------------------------------------------
            // Do not process before 6:15 PM
            // --------------------------------------------------------

            if (now.TimeOfDay <= LateCheckoutTime)
            {
                return;
            }

            var today =
                DateOnly.FromDateTime(now);

            // --------------------------------------------------------
            // Find employees who:
            //
            // 1. Checked in today
            // 2. Have not checked out
            // 3. Are not already marked LateCheckout
            // 4. Are not on leave
            // --------------------------------------------------------

            var attendanceRecords =
                await context.EmployeeAttendances
                    .Where(x =>
                        x.AttendanceDate == today &&
                        x.CheckIn.HasValue &&
                        !x.CheckOut.HasValue &&
                        !x.IsLateCheckout &&
                        x.Status != EmployeeAttendanceStatus.OnLeave.ToString() &&
                        !x.IsDeleted)
                    .ToListAsync(cancellationToken);

            if (!attendanceRecords.Any())
            {
                return;
            }

            foreach (var attendance in attendanceRecords)
            {
                attendance.IsLateCheckout = true;

                attendance.Status =
                    EmployeeAttendanceStatus.LateCheckout.ToString();

                // ----------------------------------------------------
                // Preserve existing remarks
                // ----------------------------------------------------

                var lateCheckoutRemark =
                    "Late checkout: employee did not check out by 6:15 PM.";

                if (string.IsNullOrWhiteSpace(
                    attendance.Remarks))
                {
                    attendance.Remarks =
                        lateCheckoutRemark;
                }
                else if (!attendance.Remarks.Contains(
                    "Late checkout",
                    StringComparison.OrdinalIgnoreCase))
                {
                    attendance.Remarks +=
                        " " +
                        lateCheckoutRemark;
                }

                context.EmployeeAttendances.Update(attendance);
            }

            await context.SaveChangesAsync(
                cancellationToken);
        }
    }
}