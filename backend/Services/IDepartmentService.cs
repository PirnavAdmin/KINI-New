using TalentSphereAPI.DTOs.Department;

namespace TalentSphereAPI.Services

{

    public interface IDepartmentService

    {

        Task<string> AddDepartmentAsync(

            CreateDepartmentDto dto);

        Task<List<DepartmentResponseDto>> GetDepartmentsAsync(

            int organizationId);

        Task<DepartmentResponseDto?> GetDepartmentByIdAsync(

            int departmentId);

        Task<string> UpdateDepartmentAsync(

            int departmentId,

            UpdateDepartmentDto dto);

        Task<string> DeleteDepartmentAsync(

            int departmentId);

    }

}
