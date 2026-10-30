using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.EmployeeAttendance;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories.Interfaces;

namespace TalentSphereAPI.Repositories
{
    public class EmployeeAttendanceRepository
        : IEmployeeAttendanceRepository
    {
        private readonly ApplicationDbContext _context;

        public EmployeeAttendanceRepository(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<EmployeeAttendance?> GetByIdAsync(
            int id,
            int organizationId)
        {
            return await _context.EmployeeAttendances
                .Include(x => x.Employee)
                .FirstOrDefaultAsync(x =>
                    x.EmployeeAttendanceId == id &&
                    x.OrganizationId == organizationId);
        }

        public async Task<EmployeeAttendance?> GetByEmployeeAndDateAsync(
            int employeeId,
            DateOnly date,
            int organizationId)
        {
            return await _context.EmployeeAttendances
                .Include(x => x.Employee)
                .FirstOrDefaultAsync(x =>
                    x.EmployeeId == employeeId &&
                    x.AttendanceDate == date &&
                    x.OrganizationId == organizationId);
        }

        public async Task<IEnumerable<EmployeeAttendance>> GetAllAsync(
            int organizationId,
            AttendanceFilterDto filter)
        {
            var query = _context.EmployeeAttendances
                .Include(x => x.Employee)
                .Where(x => x.OrganizationId == organizationId)
                .AsQueryable();

            if (filter.EmployeeId.HasValue)
            {
                query = query.Where(x =>
                    x.EmployeeId == filter.EmployeeId.Value);
            }

            if (filter.Date.HasValue)
            {
                query = query.Where(x =>
                    x.AttendanceDate == filter.Date.Value);
            }

            if (filter.FromDate.HasValue)
            {
                query = query.Where(x =>
                    x.AttendanceDate >= filter.FromDate.Value);
            }

            if (filter.ToDate.HasValue)
            {
                query = query.Where(x =>
                    x.AttendanceDate <= filter.ToDate.Value);
            }

            return await query
                .OrderByDescending(x => x.AttendanceDate)
                .ThenBy(x => x.EmployeeId)
                .ToListAsync();
        }

        public async Task<EmployeeAttendance> AddAsync(
            EmployeeAttendance attendance)
        {
            await _context.EmployeeAttendances.AddAsync(attendance);
            await _context.SaveChangesAsync();

            return attendance;
        }

        public async Task<EmployeeAttendance> UpdateAsync(
            EmployeeAttendance attendance)
        {
            _context.EmployeeAttendances.Update(attendance);
            await _context.SaveChangesAsync();

            return attendance;
        }

        public async Task<IEnumerable<EmployeeAttendance>> GetReportDataAsync(
            int organizationId,
            DateOnly fromDate,
            DateOnly toDate,
            int? employeeId = null)
        {
            var query = _context.EmployeeAttendances
                .Include(x => x.Employee)
                .Where(x =>
                    x.OrganizationId == organizationId &&
                    x.AttendanceDate >= fromDate &&
                    x.AttendanceDate <= toDate)
                .AsQueryable();

            if (employeeId.HasValue)
            {
                query = query.Where(x =>
                    x.EmployeeId == employeeId.Value);
            }

            return await query
                .OrderBy(x => x.EmployeeId)
                .ThenBy(x => x.AttendanceDate)
                .ToListAsync();
        }
    }
}