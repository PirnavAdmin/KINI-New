using TalentSphereAPI.DTOs;
using TalentSphereAPI.DTOs.Employee;

namespace TalentSphereAPI.Services

{

    public interface IEmployeeService

    {

        Task<(IEnumerable<EmployeeResponseDto> Employees, int TotalCount)> GetAllAsync(EmployeeQueryParameters query);

        Task<EmployeeResponseDto?> GetByIdAsync(int id);

        Task<EmployeeResponseDto> CreateAsync(CreateEmployeeDto dto);

        Task<EmployeeResponseDto?> UpdateAsync(int id, UpdateEmployeeDto dto);

        Task<bool> DeleteAsync(int id);

        Task<LoginResponseDto> GoogleLoginAsync(string credential);

    }

}

