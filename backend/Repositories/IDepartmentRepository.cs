using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories

{

    public interface IDepartmentRepository

    {

        Task<bool> AddAsync(Department department);

        Task<List<Department>> GetByOrganizationIdAsync(

            int organizationId);

        Task<Department?> GetByIdAsync(int departmentId);

        Task<bool> UpdateAsync(Department department);

        Task<bool> DeleteAsync(Department department);

        Task<bool> DepartmentExistsAsync(

            int organizationId,

            string name);

        Task<bool> ManagerExistsAsync(int managerId);

    }

}
