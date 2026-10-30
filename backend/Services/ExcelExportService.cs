using ClosedXML.Excel;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services
{
    public class ExcelExportService : IExcelExportService
    {
        private readonly IAttendanceService _attendanceService;

        public ExcelExportService(IAttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }

        public async Task<byte[]> GenerateAttendanceExcelAsync(int liveClassId)
        {
            var report = await _attendanceService.GetAttendanceReportAsync(liveClassId);

            using var workbook = new XLWorkbook();

            var worksheet = workbook.Worksheets.Add("Attendance");

            worksheet.Cell(1, 1).Value = "Attendance Report";

            worksheet.Cell(3, 1).Value = "Class";
            worksheet.Cell(3, 2).Value = report.ClassTitle;

            worksheet.Cell(4, 1).Value = "Course";
            worksheet.Cell(4, 2).Value = report.CourseName;

            worksheet.Cell(5, 1).Value = "Batch";
            worksheet.Cell(5, 2).Value = report.BatchName;

            worksheet.Cell(6, 1).Value = "Mentor";
            worksheet.Cell(6, 2).Value = report.MentorName;

            worksheet.Cell(8, 1).Value = "Student";
            worksheet.Cell(8, 2).Value = "Status";
            worksheet.Cell(8, 3).Value = "Attendance %";
            worksheet.Cell(8, 4).Value = "Minutes";

            int row = 9;

            foreach (var student in report.Students)
            {
                worksheet.Cell(row, 1).Value = student.StudentName;
                worksheet.Cell(row, 2).Value = student.Status;
                worksheet.Cell(row, 3).Value = student.AttendancePercentage;
                worksheet.Cell(row, 4).Value = student.DurationMinutes;

                row++;
            }

            using var stream = new MemoryStream();

            workbook.SaveAs(stream);

            return stream.ToArray();
        }
    }
}