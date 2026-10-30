using TalentSphereAPI.DTOs.Employee;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories
{
    public interface IEmployeeRepository
    {
        Task<(
            IEnumerable<Employee> Employees,
            int TotalCount)> GetAllAsync(
                EmployeeQueryParameters query);

        Task<Employee?> GetByIdAsync(int id);

        Task<bool> EmailExistsAsync(string email);

        Task<Employee> CreateAsync(
            Employee employee);

        Task<Employee?> UpdateAsync(
            Employee employee);

        Task<bool> DeleteAsync(int id);

        Task<Employee?> GetByGoogleSubjectIdAsync(string googleSubjectId);

        Task<Employee?> GetByEmailGlobalAsync(string email);

        Task LinkGoogleSubjectIdAsync(int employeeId, string googleSubjectId);
    }
}