using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Employee;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories
{
    public class SuperAdminEmployeeRepository
        : ISuperAdminEmployeeRepository
    {
        private readonly ApplicationDbContext _context;

        public SuperAdminEmployeeRepository(
            ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // GET ALL EMPLOYEES FOR A SPECIFIC ORGANIZATION
        // =========================================================

        public async Task<(
            IEnumerable<Employee> Employees,
            int TotalCount)>
            GetAllByOrganizationAsync(
                int organizationId,
                EmployeeQueryParameters query)
        {
            var employees = _context.Employees
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId == organizationId &&
                    !x.IsDeleted)
                .AsQueryable();

            // -----------------------------------------------------
            // SEARCH
            // -----------------------------------------------------

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();

                employees = employees.Where(x =>
                    x.FirstName.Contains(search) ||
                    x.LastName.Contains(search) ||
                    x.Email.Contains(search) ||
                    x.Phone.Contains(search) ||
                    x.Role.Contains(search));
            }

            // -----------------------------------------------------
            // STATUS FILTER
            // -----------------------------------------------------

            if (!string.IsNullOrWhiteSpace(query.Status))
            {
                var status = query.Status.Trim();

                employees = employees.Where(x =>
                    x.Status.ToLower() ==
                    status.ToLower());
            }

            // -----------------------------------------------------
            // SORT
            // -----------------------------------------------------

            employees = query.SortBy?.ToLower() switch
            {
                "firstname" =>
                    query.IsDescending
                        ? employees.OrderByDescending(
                            x => x.FirstName)
                        : employees.OrderBy(
                            x => x.FirstName),

                "lastname" =>
                    query.IsDescending
                        ? employees.OrderByDescending(
                            x => x.LastName)
                        : employees.OrderBy(
                            x => x.LastName),

                "email" =>
                    query.IsDescending
                        ? employees.OrderByDescending(
                            x => x.Email)
                        : employees.OrderBy(
                            x => x.Email),

                "role" =>
                    query.IsDescending
                        ? employees.OrderByDescending(
                            x => x.Role)
                        : employees.OrderBy(
                            x => x.Role),

                "status" =>
                    query.IsDescending
                        ? employees.OrderByDescending(
                            x => x.Status)
                        : employees.OrderBy(
                            x => x.Status),

                _ =>
                    query.IsDescending
                        ? employees.OrderByDescending(
                            x => x.EmployeeId)
                        : employees.OrderBy(
                            x => x.EmployeeId)
            };

            // -----------------------------------------------------
            // TOTAL COUNT
            // -----------------------------------------------------

            var totalCount =
                await employees.CountAsync();

            // -----------------------------------------------------
            // PAGINATION
            // -----------------------------------------------------

            var data = await employees
                .Skip(
                    (query.PageNumber - 1) *
                    query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return (data, totalCount);
        }

        // =========================================================
        // GET SINGLE EMPLOYEE
        // =========================================================

        public async Task<Employee?> GetByIdAsync(
            int organizationId,
            int employeeId)
        {
            return await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.EmployeeId == employeeId &&
                    x.OrganizationId == organizationId &&
                    !x.IsDeleted);
        }
    }
}