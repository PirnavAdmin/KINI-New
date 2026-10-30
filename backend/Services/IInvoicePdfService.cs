namespace TalentSphereAPI.Services

{

    public interface IInvoicePdfService

    {

        byte[] GenerateInvoicePdf(DTOs.Invoice.InvoiceResponseDto invoice);

    }

}
