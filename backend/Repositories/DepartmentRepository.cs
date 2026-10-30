using Microsoft.EntityFrameworkCore;

using TalentSphereAPI.Data;

using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories

{

    public class DepartmentRepository : IDepartmentRepository

    {

        private readonly ApplicationDbContext _context;

        public DepartmentRepository(ApplicationDbContext context)

        {

            _context = context;

        }

        public async Task<bool> AddAsync(Department department)

        {

            await _context.Departments.AddAsync(department);

            return await _context.SaveChangesAsync() > 0;

        }

        public async Task<List<Department>> GetByOrganizationIdAsync(

            int organizationId)

        {

            return await _context.Departments

                .Include(d => d.Manager)

                .Where(d => d.OrganizationId == organizationId)

                .ToListAsync();

        }

        public async Task<Department?> GetByIdAsync(int departmentId)

        {

            return await _context.Departments

                .Include(d => d.Manager)

                .FirstOrDefaultAsync(d => d.DepartmentId == departmentId);

        }

        public async Task<bool> UpdateAsync(Department department)

        {

            _context.Departments.Update(department);

            return await _context.SaveChangesAsync() > 0;

        }

        public async Task<bool> DeleteAsync(Department department)

        {

            _context.Departments.Remove(department);

            return await _context.SaveChangesAsync() > 0;

        }

        public async Task<bool> DepartmentExistsAsync(

            int organizationId,

            string name)

        {

            return await _context.Departments.AnyAsync(d =>

                d.OrganizationId == organizationId &&

                d.Name.ToLower() == name.ToLower());

        }

        public async Task<bool> ManagerExistsAsync(int managerId)

        {

            return await _context.Employees

                .AnyAsync(e => e.EmployeeId == managerId);

        }

    }

}
