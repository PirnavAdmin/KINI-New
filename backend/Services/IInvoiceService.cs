using TalentSphereAPI.DTOs.Common;
using TalentSphereAPI.DTOs.Invoice;
using TalentSphereAPI.Services.Interfaces;
namespace TalentSphereAPI.Services
{
    public interface IInvoiceService
    {
        Task<PagedResponse<InvoiceResponseDto>> GetAllAsync(
            InvoiceQueryParameters parameters);

        Task<InvoiceResponseDto?> GetByIdAsync(int id);

        Task<InvoiceResponseDto> CreateAsync(
            CreateInvoiceDto dto);

        Task<bool> UpdateAsync(
            int id,
            UpdateInvoiceDto dto);

        Task<bool> CancelAsync(
            int id,
            string? reason);

        Task<bool> SendInvoiceEmailAsync(
            int invoiceId,
            SendInvoiceEmailDto dto);
    }
}