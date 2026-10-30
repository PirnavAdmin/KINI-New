using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;

namespace TalentSphereAPI.Services
{
    public class ClassReminderBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly DateTimeService _dateTimeService;

        public ClassReminderBackgroundService(
            IServiceScopeFactory serviceScopeFactory,
            DateTimeService dateTimeService)
        {
            _serviceScopeFactory = serviceScopeFactory;
            _dateTimeService = dateTimeService;
        }
        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope =
                    _serviceScopeFactory.CreateScope();

                var context =
                    scope.ServiceProvider
                        .GetRequiredService<ApplicationDbContext>();

                var notificationService =
                    scope.ServiceProvider
                        .GetRequiredService<INotificationService>();

                var now = _dateTimeService.Now();

                var reminderTime = now.AddMinutes(15);

                var liveClasses = await context.LiveClasses
                    .Where(x =>
                        x.Status == "Scheduled" &&
                        !x.ReminderSent &&
                        x.ScheduledDate.Date == reminderTime.Date &&
                        x.StartTime.Hours == reminderTime.Hour &&
                        x.StartTime.Minutes == reminderTime.Minute)
                    .ToListAsync(stoppingToken);

                foreach (var liveClass in liveClasses)
                {
                    var studentIds = await context.Students
                        .Where(s => s.BatchId == liveClass.BatchId)
                        .Select(s => s.StudentId)
                        .ToListAsync(stoppingToken);

                    await notificationService.NotifyClassReminderAsync(
                        liveClass.MentorId,
                        liveClass.BatchId,
                        liveClass.LiveClassId,
                        liveClass.ClassTitle,
                        studentIds);

                    liveClass.ReminderSent = true;
                }

                await context.SaveChangesAsync(stoppingToken);

                await Task.Delay(
                    TimeSpan.FromMinutes(1),
                    stoppingToken);
            }
        }
    }
}