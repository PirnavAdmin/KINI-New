using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Employee;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Repositories
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ITenantContext _tenantContext;

        public EmployeeRepository(
            ApplicationDbContext context,
            ITenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        private int OrganizationId =>
            _tenantContext.OrganizationId;


        public async Task<Employee?> GetByGoogleSubjectIdAsync(
     string googleSubjectId)
        {
            if (string.IsNullOrWhiteSpace(googleSubjectId))
                return null;

            return await _context.Employees
                .AsNoTracking()
                .Include(e => e.User)
                .FirstOrDefaultAsync(e =>
                    e.GoogleSubjectId == googleSubjectId &&
                    !e.IsDeleted);
        }
        public async Task<Employee?> GetByEmailGlobalAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return null;

            email = email.Trim();

            return await _context.Employees
                .AsNoTracking()
                .Include(e => e.User)
                .FirstOrDefaultAsync(e =>
                    e.Email == email &&
                    !e.IsDeleted);
        }
        public async Task LinkGoogleSubjectIdAsync(
     int employeeId,
     string googleSubjectId)
        {
            if (string.IsNullOrWhiteSpace(googleSubjectId))
                throw new ArgumentException(
                    "Google Subject ID is required.",
                    nameof(googleSubjectId));

            var updatedRows = await _context.Employees
                .Where(e =>
                    e.EmployeeId == employeeId &&
                    !e.IsDeleted)
                .ExecuteUpdateAsync(setters =>
                    setters.SetProperty(
                        e => e.GoogleSubjectId,
                        googleSubjectId));

            if (updatedRows == 0)
                throw new KeyNotFoundException(
                    "Employee not found.");
        }

        // ==========================================
        // GET ALL EMPLOYEES
        // ==========================================

        public async Task<(
            IEnumerable<Employee> Employees,
            int TotalCount)> GetAllAsync(
                EmployeeQueryParameters query)
        {
            var organizationId = OrganizationId;

            var employees = _context.Employees
                .AsNoTracking()
                .Where(x =>
                    x.OrganizationId == organizationId &&
                    !x.IsDeleted)
                .AsQueryable();

            // ======================================
            // SEARCH
            // ======================================

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search =
                    query.Search.Trim();

                employees = employees.Where(x =>
                    x.FirstName.Contains(search) ||
                    x.LastName.Contains(search) ||
                    x.Email.Contains(search) ||
                    x.Phone.Contains(search) ||
                    x.Role.Contains(search) ||

                    // NEW
                    x.EmployeeType.Contains(search));
            }

            // ======================================
            // STATUS FILTER
            // ======================================

            if (!string.IsNullOrWhiteSpace(query.Status))
            {
                var status =
                    query.Status.Trim();

                employees = employees.Where(x =>
                    x.Status.ToLower() ==
                    status.ToLower());
            }

            // ======================================
            // EMPLOYEE TYPE FILTER
            // ======================================
            //
            // If EmployeeQueryParameters has
            // EmployeeType, this allows filtering
            // Full-Time / Part-Time.
            //
            // If you haven't added EmployeeType
            // to query parameters yet, this block
            // should NOT be added.
            // ======================================

            // if (!string.IsNullOrWhiteSpace(query.EmployeeType))
            // {
            //     var employeeType =
            //         query.EmployeeType.Trim();
            //
            //     employees = employees.Where(x =>
            //         x.EmployeeType.ToLower() ==
            //         employeeType.ToLower());
            // }

            // ======================================
            // SORTING
            // ======================================

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

                // NEW
                "employeetype" =>
                    query.IsDescending
                        ? employees.OrderByDescending(
                            x => x.EmployeeType)
                        : employees.OrderBy(
                            x => x.EmployeeType),

                _ =>
                    query.IsDescending
                        ? employees.OrderByDescending(
                            x => x.EmployeeId)
                        : employees.OrderBy(
                            x => x.EmployeeId)
            };

            // ======================================
            // TOTAL COUNT
            // ======================================

            var totalCount =
                await employees.CountAsync();

            // ======================================
            // PAGINATION
            // ======================================

            var data = await employees
                .Skip(
                    (query.PageNumber - 1) *
                    query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return (
                data,
                totalCount);
        }

        // ==========================================
        // GET EMPLOYEE BY ID
        // ==========================================

        public async Task<Employee?> GetByIdAsync(
            int id)
        {
            var organizationId =
                OrganizationId;

            return await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.EmployeeId == id &&
                    x.OrganizationId ==
                        organizationId &&
                    !x.IsDeleted);
        }

        // ==========================================
        // CHECK DUPLICATE EMAIL
        // ==========================================

        public async Task<bool> EmailExistsAsync(
            string email)
        {
            var organizationId =
                OrganizationId;

            email = email.Trim();

            return await _context.Employees
                .AsNoTracking()
                .AnyAsync(x =>
                    x.OrganizationId ==
                        organizationId &&

                    x.Email == email &&

                    !x.IsDeleted);
        }

        // ==========================================
        // CREATE EMPLOYEE
        // ==========================================

        public async Task<Employee> CreateAsync(
            Employee employee)
        {
            var organizationId =
                OrganizationId;

            // ======================================
            // NEVER TRUST OrganizationId FROM
            // FRONTEND
            // ======================================

            employee.OrganizationId =
                organizationId;

            await using var transaction =
                await _context.Database
                    .BeginTransactionAsync();

            try
            {
                // ==================================
                // SAVE EMPLOYEE
                // ==================================

                await _context.Employees
                    .AddAsync(employee);

                await _context.SaveChangesAsync();

                // ==================================
                // EMPLOYEE -> MENTOR
                // ==================================

                if (employee.Role.Equals(
                    "Mentor",
                    StringComparison.OrdinalIgnoreCase))
                {
                    var mentor = new Mentor
                    {
                        EmployeeId =
                            employee.EmployeeId,

                        OrganizationId =
                            employee.OrganizationId,

                        FirstName =
                            employee.FirstName,

                        LastName =
                            employee.LastName,

                        Email =
                            employee.Email,

                        Phone =
                            employee.Phone,

                        PasswordHash =
                            employee.PasswordHash,

                        Status =
                            employee.Status.Equals(
                                "Active",
                                StringComparison.OrdinalIgnoreCase),

                        CreatedDate =
                            DateTime.UtcNow
                    };

                    await _context.Mentors
                        .AddAsync(mentor);

                    await _context.SaveChangesAsync();
                }

                // ==================================
                // COMMIT
                // ==================================

                await transaction.CommitAsync();

                return employee;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ==========================================
        // UPDATE EMPLOYEE
        // ==========================================

        public async Task<Employee?> UpdateAsync(
            Employee employee)
        {
            var organizationId =
                OrganizationId;

            var existing =
                await _context.Employees
                    .FirstOrDefaultAsync(x =>
                        x.EmployeeId ==
                            employee.EmployeeId &&

                        x.OrganizationId ==
                            organizationId &&

                        !x.IsDeleted);

            if (existing == null)
                return null;

            // ======================================
            // UPDATE BASIC INFORMATION
            // ======================================

            existing.FirstName =
                employee.FirstName;

            existing.LastName =
                employee.LastName;

            existing.Email =
                employee.Email;

            existing.Phone =
                employee.Phone;

            existing.Role =
                employee.Role;

            existing.Status =
                employee.Status;

            // ======================================
            // NEW: EMPLOYEE TYPE
            // ======================================

            existing.EmployeeType =
                employee.EmployeeType;

            await _context.SaveChangesAsync();

            return existing;
        }

        // ==========================================
        // DELETE EMPLOYEE
        // ==========================================

        public async Task<bool> DeleteAsync(
            int employeeId)
        {
            var organizationId =
                OrganizationId;

            var employee =
                await _context.Employees
                    .FirstOrDefaultAsync(x =>
                        x.EmployeeId ==
                            employeeId &&

                        x.OrganizationId ==
                            organizationId &&

                        !x.IsDeleted);

            if (employee == null)
                return false;

            // ======================================
            // SOFT DELETE
            // ======================================

            employee.IsDeleted = true;

            employee.DeletedOn =
                DateTime.UtcNow;

            employee.DeletedBy =
                "OrganizationAdmin";

            await _context.SaveChangesAsync();

            return true;
        }
    }
}