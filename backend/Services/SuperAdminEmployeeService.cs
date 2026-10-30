using TalentSphereAPI.DTOs.Employee;
using TalentSphereAPI.Repositories;

namespace TalentSphereAPI.Services
{
    public class SuperAdminEmployeeService
        : ISuperAdminEmployeeService
    {
        private readonly ISuperAdminEmployeeRepository _repository;

        public SuperAdminEmployeeService(
            ISuperAdminEmployeeRepository repository)
        {
            _repository = repository;
        }

        // =========================================================
        // GET ALL EMPLOYEES
        // =========================================================

        public async Task<(
            IEnumerable<EmployeeResponseDto> Employees,
            int TotalCount)>
            GetAllByOrganizationAsync(
                int organizationId,
                EmployeeQueryParameters query)
        {
            if (organizationId <= 0)
            {
                throw new ArgumentException(
                    "Invalid organization ID.");
            }

            var result =
                await _repository.GetAllByOrganizationAsync(
                    organizationId,
                    query);

            var employees =
                result.Employees.Select(employee =>
                    new EmployeeResponseDto
                    {
                        EmployeeId =
                            employee.EmployeeId,

                        FirstName =
                            employee.FirstName,

                        LastName =
                            employee.LastName,

                        Email =
                            employee.Email,

                        Phone =
                            employee.Phone,

                        Role =
                            employee.Role,

                        Status =
                            employee.Status
                    });

            return (
                employees,
                result.TotalCount);
        }

        // =========================================================
        // GET SINGLE EMPLOYEE
        // =========================================================

        public async Task<EmployeeResponseDto?>
            GetByIdAsync(
                int organizationId,
                int employeeId)
        {
            if (organizationId <= 0)
            {
                throw new ArgumentException(
                    "Invalid organization ID.");
            }

            if (employeeId <= 0)
            {
                throw new ArgumentException(
                    "Invalid employee ID.");
            }

            var employee =
                await _repository.GetByIdAsync(
                    organizationId,
                    employeeId);

            if (employee == null)
                return null;

            return new EmployeeResponseDto
            {
                EmployeeId =
                    employee.EmployeeId,

                FirstName =
                    employee.FirstName,

                LastName =
                    employee.LastName,

                Email =
                    employee.Email,

                Phone =
                    employee.Phone,

                Role =
                    employee.Role,

                Status =
                    employee.Status
            };
        }
    }
}