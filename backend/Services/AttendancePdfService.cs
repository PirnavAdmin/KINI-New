using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using TalentSphereAPI.Services.Interfaces;
namespace TalentSphereAPI.Services
{
    public class AttendancePdfService : IAttendancePdfService
    {
        private readonly IAttendanceService _attendanceService;

        public AttendancePdfService(IAttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }
        public async Task<byte[]> GenerateAttendanceReportPdfAsync(int liveClassId)
        {
            var report =
                await _attendanceService.GetAttendanceReportAsync(liveClassId);

            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(25);

                    page.Header().Text("Attendance Report")
                        .FontSize(22)
                        .Bold();

                    page.Content().Column(col =>
                    {
                        col.Item().Text($"Class : {report.ClassTitle}");

                        col.Item().Text($"Course : {report.CourseName}");

                        col.Item().Text($"Batch : {report.BatchName}");

                        col.Item().Text($"Mentor : {report.MentorName}");

                        col.Item().Text($"Date : {report.ScheduledDate:d}");

                        col.Item().PaddingVertical(10);

                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(3);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(2);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Text("Student");
                                header.Cell().Text("Status");
                                header.Cell().Text("Attendance %");
                                header.Cell().Text("Minutes");
                            });

                            foreach (var student in report.Students)
                            {
                                table.Cell().Text(student.StudentName);

                                table.Cell().Text(student.Status);

                                table.Cell().Text(
                                    $"{student.AttendancePercentage}%");

                                table.Cell().Text(
                                    student.DurationMinutes.ToString());
                            }
                        });

                        col.Item().PaddingTop(20);

                        col.Item().Text(
                            $"Present : {report.PresentStudents}");

                        col.Item().Text(
                            $"Late : {report.LateStudents}");

                        col.Item().Text(
                            $"Absent : {report.AbsentStudents}");

                        col.Item().Text(
                            $"Average : {report.AverageAttendance}%");
                    });
                });
            });

            return pdf.GeneratePdf();
        }
    }
}
