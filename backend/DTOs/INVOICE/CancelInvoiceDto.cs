using System.ComponentModel.DataAnnotations;

namespace TalentSphereAPI.DTOs.Invoice
{
    public class CancelInvoiceDto
    {
        [MaxLength(500)]
        public string? Reason { get; set; }
    }
}