using TalentSphereAPI.DTOs.EmployeeAttendance;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories.Interfaces
{
    public interface IEmployeeAttendanceRepository
    {
        Task<EmployeeAttendance?> GetByIdAsync(
            int id,
            int organizationId);

        Task<EmployeeAttendance?> GetByEmployeeAndDateAsync(
            int employeeId,
            DateOnly date,
            int organizationId);

        Task<IEnumerable<EmployeeAttendance>> GetAllAsync(
            int organizationId,
            AttendanceFilterDto filter);

        Task<EmployeeAttendance> AddAsync(
            EmployeeAttendance attendance);

        Task<EmployeeAttendance> UpdateAsync(
            EmployeeAttendance attendance);

        Task<IEnumerable<EmployeeAttendance>> GetReportDataAsync(
            int organizationId,
            DateOnly fromDate,
            DateOnly toDate,
            int? employeeId = null);
    }
}