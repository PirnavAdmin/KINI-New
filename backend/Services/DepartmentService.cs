using TalentSphereAPI.DTOs.Department;

using TalentSphereAPI.Models;

using TalentSphereAPI.Repositories;

namespace TalentSphereAPI.Services

{

    public class DepartmentService : IDepartmentService

    {

        private readonly IDepartmentRepository _repository;

        public DepartmentService(IDepartmentRepository repository)

        {

            _repository = repository;

        }

        public async Task<string> AddDepartmentAsync(CreateDepartmentDto dto)

        {

            var department = new Department

            {

                OrganizationId = dto.OrganizationId, // IMPORTANT: replace with auth/org context

                Name = dto.Name,

                Description = dto.Description,

                ManagerId = dto.ManagerId

            };

            var result = await _repository.AddAsync(department);

            return result ? "Department Created Successfully" : "Failed";

        }

        public async Task<List<DepartmentResponseDto>> GetDepartmentsAsync(int organizationId)

        {

            var departments = await _repository.GetByOrganizationIdAsync(organizationId);

            return departments.Select(d => new DepartmentResponseDto

            {

                DepartmentId = d.DepartmentId,

                Name = d.Name,

                Description = d.Description,

                ManagerId = d.ManagerId,

                ManagerName = d.Manager != null

                    ? $"{d.Manager.FirstName} {d.Manager.LastName}"

                    : null

            }).ToList();

        }

        public async Task<DepartmentResponseDto?> GetDepartmentByIdAsync(int departmentId)

        {

            var d = await _repository.GetByIdAsync(departmentId);

            if (d == null) return null;

            return new DepartmentResponseDto

            {

                DepartmentId = d.DepartmentId,

                Name = d.Name,

                Description = d.Description,

                ManagerId = d.ManagerId,

                ManagerName = d.Manager != null

                    ? $"{d.Manager.FirstName} {d.Manager.LastName}"

                    : null

            };

        }

        public async Task<string> UpdateDepartmentAsync(int departmentId, UpdateDepartmentDto dto)

        {

            var department = await _repository.GetByIdAsync(departmentId);

            if (department == null)

                return "Department Not Found";

            department.Name = dto.Name;

            department.Description = dto.Description;

            department.ManagerId = dto.ManagerId;

            var result = await _repository.UpdateAsync(department);

            return result ? "Updated Successfully" : "Failed";

        }

        public async Task<string> DeleteDepartmentAsync(int departmentId)

        {

            var department = await _repository.GetByIdAsync(departmentId);

            if (department == null)

                return "Not Found";

            var result = await _repository.DeleteAsync(department);

            return result ? "Deleted Successfully" : "Failed";

        }

    }

}
