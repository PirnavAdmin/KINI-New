using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.RecycleBin;
using TalentSphereAPI.Repositories.Interfaces;

namespace TalentSphereAPI.Repositories
{
    public class RecycleBinRepository : IRecycleBinRepository
    {
        private readonly ApplicationDbContext _context;

        public RecycleBinRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // ===========================
        // USERS
        // ===========================

        public async Task<List<DeletedRecordDto>> GetDeletedUsersAsync()
        {
            return await _context.Users
                .Where(x => x.IsDeleted)
                .Select(x => new DeletedRecordDto
                {
                    Id = x.UserId,
                    RecordId = x.UserId,
                    ModuleName = "User",
                    Name = x.FirstName + " " + x.LastName,
                    DeletedBy = x.DeletedBy,
                    DeletedOn = x.DeletedOn
                })
                .ToListAsync();
        }

        public async Task<bool> RestoreUserAsync(int userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.UserId == userId && x.IsDeleted);

            if (user == null)
                return false;

            user.IsDeleted = false;
            user.DeletedBy = null;
            user.DeletedOn = null;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> PermanentlyDeleteUserAsync(int userId)
        {
            var user = await _context.Users
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (user == null)
                return false;

            user.IsDeleted = true;
            user.DeletedOn = DateTime.UtcNow;
            user.DeletedBy = "Admin";

            await _context.SaveChangesAsync();
            return true;
        }

        // ===========================
        // Remaining modules
        // ===========================

        public async Task<List<DeletedRecordDto>> GetDeletedStudentsAsync()
        {
            return await _context.Students
                .Where(x => x.IsDeleted)
                .Select(x => new DeletedRecordDto
                {
                    Id = x.StudentId,
                    RecordId = x.StudentId,
                    ModuleName = "Student",
                    Name = x.FirstName + " " + x.LastName,
                    DeletedBy = x.DeletedBy,
                    DeletedOn = x.DeletedOn
                })
                .ToListAsync();
        }
        public async Task<List<DeletedRecordDto>> GetDeletedMentorsAsync()
        {
            return await _context.Mentors
                .Where(x => x.IsDeleted)
                .Select(x => new DeletedRecordDto
                {
                    Id = x.MentorId,
                    Name = x.FirstName + " " + x.LastName,
                    
                    DeletedOn = x.DeletedOn,
                    DeletedBy = x.DeletedBy
                })
                .ToListAsync();
        }
        public async Task<List<DeletedRecordDto>> GetDeletedEmployeesAsync()
        {
            return await _context.Employees
                .Where(x => x.IsDeleted)
                .Select(x => new DeletedRecordDto
                {
                    Id = x.EmployeeId,
                    RecordId = x.EmployeeId,
                    ModuleName = "Employee",
                    Name = x.FirstName + " " + x.LastName,
                    DeletedBy = x.DeletedBy,
                    DeletedOn = x.DeletedOn
                })
                .ToListAsync();
        }
        public async Task<bool> RestoreStudentAsync(int studentId)
        {
            var student = await _context.Students
                .FirstOrDefaultAsync(x => x.StudentId == studentId && x.IsDeleted);

            if (student == null)
                return false;

            student.IsDeleted = false;
            student.DeletedOn = null;
            student.DeletedBy = null;

            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<bool> RestoreMentorAsync(int mentorId)
        {
            var mentor = await _context.Mentors
                .FirstOrDefaultAsync(x => x.MentorId == mentorId && x.IsDeleted);

            if (mentor == null)
                return false;

            mentor.IsDeleted = false;
            mentor.DeletedOn = null;
            mentor.DeletedBy = null;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RestoreEmployeeAsync(int employeeId)
        {
            var employee = await _context.Employees
                .FirstOrDefaultAsync(x => x.EmployeeId == employeeId && x.IsDeleted);

            if (employee == null)
                return false;

            employee.IsDeleted = false;
            employee.DeletedOn = null;
            employee.DeletedBy = null;

            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> PermanentlyDeleteStudentAsync(int studentId)
        {
            var student = await _context.Students
                .FirstOrDefaultAsync(x => x.StudentId == studentId && x.IsDeleted);

            if (student == null)
                return false;

            _context.Students.Remove(student);

            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<bool> PermanentlyDeleteMentorAsync(int mentorId)
        {
            var mentor = await _context.Mentors
                .FirstOrDefaultAsync(x => x.MentorId == mentorId && x.IsDeleted);

            if (mentor == null)
                return false;

            _context.Mentors.Remove(mentor);
            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<bool> PermanentlyDeleteEmployeeAsync(int employeeId)
        {
            var employee = await _context.Employees
                .FirstOrDefaultAsync(x => x.EmployeeId == employeeId && x.IsDeleted);

            if (employee == null)
                return false;

            _context.Employees.Remove(employee);

            await _context.SaveChangesAsync();
            return true;
        }
    }
}