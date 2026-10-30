using TalentSphereAPI.Enums;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Repositories
{
    public interface IInvoiceRepository
    {
        Task<(IEnumerable<Invoice> Invoices, int TotalCount)> GetAllAsync(
            string? search,
            InvoiceStatus? status,
            int? studentId,
            int? courseId,
            DateTime? fromDate,
            DateTime? toDate,
            string? sortBy,
            string? sortOrder,
            int page,
            int pageSize);

        Task<Invoice?> GetByIdAsync(int id);

        Task<Invoice> CreateAsync(Invoice invoice);

        Task<bool> UpdateAsync(Invoice invoice);

        Task<bool> StudentExistsAsync(int studentId);

        Task<bool> CourseExistsAsync(int courseId);

        Task<bool> InvoiceNumberExistsAsync(string invoiceNumber);

        Task<bool> SaveAsync();
    }
}