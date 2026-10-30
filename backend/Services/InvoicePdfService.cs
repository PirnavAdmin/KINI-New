using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using TalentSphereAPI.DTOs.Invoice;
using TalentSphereAPI.Enums;

namespace TalentSphereAPI.Services
{
    public class InvoicePdfService : IInvoicePdfService
    {
        private const string Navy = "#02528F";
        private const string NavyDark = "#003E70";
        private const string Orange = "#FF6717";
        private const string LightBlue = "#F0F8FE";
        private const string BorderBlue = "#9CC9E8";
        private const string Gold = "#FEE7B2";
        private const string PaidGreen = "#1F9D4C";
        private const string MutedText = "#49627A";

        private readonly IWebHostEnvironment _environment;

        public InvoicePdfService(
            IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public byte[] GenerateInvoicePdf(
            InvoiceResponseDto invoice)
        {
            QuestPDF.Settings.License =
                LicenseType.Community;

            var logoBytes =
                LoadLogo();

            return Document.Create(document =>
            {
                document.Page(page =>
                {
                    page.Size(PageSizes.A4);

                    page.MarginHorizontal(24);
                    page.MarginTop(20);
                    page.MarginBottom(18);

                    page.DefaultTextStyle(
                        x => x
                            .FontFamily("Arial")
                            .FontSize(9.2f)
                            .FontColor(NavyDark));

                    // HEADER
                    page.Header()
                        .Element(container =>
                            ComposeHeader(
                                container,
                                invoice,
                                logoBytes));

                    // CONTENT
                    page.Content()
                        .PaddingTop(8)
                        .Column(column =>
                        {
                            column.Spacing(8);

                            // =====================================
                            // BILL TO + INVOICE DETAILS
                            // =====================================

                            column.Item()
                                .Row(row =>
                                {
                                    row.RelativeItem()
                                        .Element(container =>
                                            ComposeBillTo(
                                                container,
                                                invoice));

                                    row.ConstantItem(10);

                                    row.RelativeItem()
                                        .Element(container =>
                                            ComposeInvoiceDetails(
                                                container,
                                                invoice));
                                });

                            // =====================================
                            // ITEMS
                            // =====================================

                            column.Item()
                                .Element(container =>
                                    ComposeItemsTable(
                                        container,
                                        invoice));

                            // =====================================
                            // TOTALS
                            // =====================================

                            column.Item()
                                .Element(container =>
                                    ComposeTotals(
                                        container,
                                        invoice));

                            // =====================================
                            // PAYMENT + TERMS
                            // =====================================

                            column.Item()
                                .Row(row =>
                                {
                                    row.RelativeItem(4)
                                        .Element(container =>
                                            ComposePaymentDetails(
                                                container,
                                                invoice));

                                    row.ConstantItem(10);

                                    row.RelativeItem(6)
                                        .Element(container =>
                                            ComposeTerms(
                                                container,
                                                invoice));
                                });
                        });

                    // FOOTER
                    page.Footer()
                        .Element(container =>
                            ComposeFooter(
                                container,
                                invoice));
                });
            })
            .GeneratePdf();
        }

        // =====================================================
        // HEADER
        // =====================================================

        private void ComposeHeader(
            IContainer container,
            InvoiceResponseDto invoice,
            byte[]? logoBytes)
        {
            container.Column(column =>
            {
                column.Item()
                    .Row(row =>
                    {
                        // -------------------------------------
                        // LOGO
                        // -------------------------------------

                        row.ConstantItem(155)
                            .AlignLeft()
                            .AlignMiddle()
                            .Element(logo =>
                            {
                                if (logoBytes != null)
                                {
                                    logo
                                        .Height(74)
                                        .Image(logoBytes)
                                        .FitArea();
                                }
                                else
                                {
                                    logo
                                        .Text("Kini")
                                        .Bold()
                                        .FontSize(31)
                                        .FontColor(Navy);
                                }
                            });

                        // -------------------------------------
                        // ORGANIZATION
                        // -------------------------------------

                        row.RelativeItem()
                            .PaddingLeft(8)
                            .AlignMiddle()
                            .Column(company =>
                            {
                                company.Item()
                                    .Text(
                                        string.IsNullOrWhiteSpace(
                                            invoice.OrganizationName)
                                            ? "Organization"
                                            : invoice.OrganizationName)
                                    .Bold()
                                    .FontSize(21)
                                    .FontColor(Navy);

                                if (!string.IsNullOrWhiteSpace(
                                    invoice.RegisteredAddress))
                                {
                                    company.Item()
                                        .PaddingTop(2)
                                        .Text(
                                            invoice.RegisteredAddress)
                                        .FontSize(8.7f);
                                }

                                AddContactLine(
                                    company,
                                    invoice.OrganizationEmail);

                                AddContactLine(
                                    company,
                                    invoice.OrganizationPhone);

                                AddContactLine(
                                    company,
                                    invoice.OrganizationWebsite);
                            });

                        // -------------------------------------
                        // SEPARATOR
                        // -------------------------------------

                        row.ConstantItem(1)
                            .Height(82)
                            .Background(Navy)
                            .ExtendVertical();

                        row.ConstantItem(15);

                        // -------------------------------------
                        // INVOICE TITLE
                        // -------------------------------------

                        row.ConstantItem(230)
                            .AlignMiddle()
                            .Column(title =>
                            {
                                title.Item()
                                    .Text("EDUCATION FEE")
                                    .Bold()
                                    .FontSize(19)
                                    .FontColor(Navy);

                                title.Item()
                                    .Text("INVOICE")
                                    .Bold()
                                    .FontSize(29)
                                    .FontColor(Orange);

                                title.Item()
                                    .Text(
                                        "Empowering Future Through Technology")
                                    .FontSize(8.8f)
                                    .FontColor(MutedText);
                            });
                    });

                // ORANGE LINE
                column.Item()
                    .PaddingTop(8)
                    .LineHorizontal(2)
                    .LineColor(Orange);
            });
        }

        private static void AddContactLine(
            ColumnDescriptor column,
            string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return;

            column.Item()
                .PaddingTop(1)
                .Text(value)
                .FontSize(8.5f)
                .FontColor(NavyDark);
        }

        // =====================================================
        // BILL TO
        // =====================================================

        private static void ComposeBillTo(
            IContainer container,
            InvoiceResponseDto invoice)
        {
            ComposeInfoBox(
                container,
                "BILL TO",
                content =>
                {
                    InfoRow(
                        content,
                        "Student Name",
                        invoice.StudentName);

                    InfoRow(
                        content,
                        "Billing Address",
                        string.IsNullOrWhiteSpace(
                            invoice.BillingAddress)
                            ? "Not provided"
                            : invoice.BillingAddress);

                    InfoRow(
                        content,
                        "Email",
                        invoice.StudentEmail);

                    InfoRow(
                        content,
                        "Phone",
                        invoice.StudentPhone);
                });
        }

        // =====================================================
        // INVOICE DETAILS
        // =====================================================

        private static void ComposeInvoiceDetails(
            IContainer container,
            InvoiceResponseDto invoice)
        {
            var paymentTerms =
                invoice.DueDate.Date <= invoice.IssueDate.Date
                    ? "Due on Receipt"
                    : $"Due by {invoice.DueDate:dd-MMM-yyyy}";

            ComposeInfoBox(
                container,
                "INVOICE DETAILS",
                content =>
                {
                    InfoRow(
                        content,
                        "Invoice No",
                        invoice.InvoiceNumber);

                    InfoRow(
                        content,
                        "Invoice Date",
                        invoice.IssueDate
                            .ToString("dd-MMM-yyyy"));

                    InfoRow(
                        content,
                        "Payment Terms",
                        paymentTerms);

                    InfoRow(
                        content,
                        "Place of Supply",
                        string.IsNullOrWhiteSpace(
                            invoice.PlaceOfSupply)
                            ? "Not configured"
                            : invoice.PlaceOfSupply);

                    InfoRow(
                        content,
                        "Currency",
                        invoice.Currency);

                    InfoRow(
                        content,
                        "Invoice Type",
                        "Course Enrollment");
                });
        }

        // =====================================================
        // INFO BOX
        // =====================================================

        private static void ComposeInfoBox(
            IContainer container,
            string title,
            Action<ColumnDescriptor> composeContent)
        {
            container
                .Border(1)
                .BorderColor(BorderBlue)
                .CornerRadius(4)
                .Background(Colors.White)
                .Column(column =>
                {
                    column.Item()
                        .Background(Navy)
                        .PaddingHorizontal(10)
                        .PaddingVertical(6)
                        .Text(title)
                        .Bold()
                        .FontSize(10.5f)
                        .FontColor(Colors.White);

                    column.Item()
                        .Background(LightBlue)
                        .PaddingHorizontal(10)
                        .PaddingVertical(7)
                        .Column(composeContent);
                });
        }

        private static void InfoRow(
            ColumnDescriptor column,
            string label,
            string? value)
        {
            column.Item()
                .PaddingBottom(3)
                .Row(row =>
                {
                    row.ConstantItem(88)
                        .Text(label + " :")
                        .Bold()
                        .FontSize(8.7f);

                    row.RelativeItem()
                        .Text(
                            string.IsNullOrWhiteSpace(value)
                                ? "Not available"
                                : value)
                        .FontSize(8.7f);
                });
        }

        // =====================================================
        // ITEM TABLE
        // =====================================================

        private static void ComposeItemsTable(
            IContainer container,
            InvoiceResponseDto invoice)
        {
            container
                .Border(1)
                .BorderColor(BorderBlue)
                .CornerRadius(4)
                .Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.ConstantColumn(42);

                        columns.RelativeColumn(2.8f);

                        columns.RelativeColumn(1.05f);

                        columns.RelativeColumn(1.05f);

                        columns.ConstantColumn(42);

                        columns.RelativeColumn(1.35f);

                        columns.RelativeColumn(1.45f);
                    });

                    HeaderCell(
                        table,
                        "S.No");

                    HeaderCell(
                        table,
                        "Course / Service");

                    HeaderCell(
                        table,
                        "Duration");

                    HeaderCell(
                        table,
                        "Batch Type");

                    HeaderCell(
                        table,
                        "Qty");

                    HeaderCell(
                        table,
                        $"Unit Fee\n({invoice.Currency})");

                    HeaderCell(
                        table,
                        $"Taxable Amount\n({invoice.Currency})");

                    // DATA
                    BodyCell(
                        table,
                        "1",
                        center: true);

                    BodyCell(
                        table,
                        invoice.CourseName,
                        wrap: true);

                    BodyCell(
                        table,
                        invoice.Duration,
                        center: true,
                        wrap: true);

                    BodyCell(
                        table,
                        string.IsNullOrWhiteSpace(
                            invoice.BatchType)
                            ? "Not available"
                            : invoice.BatchType,
                        center: true,
                        wrap: true);

                    BodyCell(
                        table,
                        "1",
                        center: true);

                    BodyCell(
                        table,
                        FormatMoney(
                            invoice.SubTotal,
                            invoice.Currency),
                        right: true);

                    BodyCell(
                        table,
                        FormatMoney(
                            invoice.TaxableAmount,
                            invoice.Currency),
                        right: true);
                });
        }

        private static void HeaderCell(
            TableDescriptor table,
            string text)
        {
            table.Cell()
                .Background(Navy)
                .BorderRight(1)
                .BorderColor(Colors.White)
                .PaddingHorizontal(5)
                .PaddingVertical(6)
                .AlignCenter()
                .AlignMiddle()
                .Text(text)
                .Bold()
                .FontSize(8.6f)
                .FontColor(Colors.White);
        }

        private static void BodyCell(
            TableDescriptor table,
            string? text,
            bool right = false,
            bool center = false,
            bool wrap = false)
        {
            var cell =
                table.Cell()
                    .Background(Colors.White)
                    .BorderRight(1)
                    .BorderTop(1)
                    .BorderColor(BorderBlue)
                    .PaddingHorizontal(5)
                    .PaddingVertical(7)
                    .AlignMiddle();

            if (right)
                cell = cell.AlignRight();
            else if (center)
                cell = cell.AlignCenter();

            var textContainer =
                cell.Text(text ?? string.Empty)
                    .FontSize(8.8f);

        }

        // =====================================================
        // TOTALS
        // =====================================================

        private static void ComposeTotals(
            IContainer container,
            InvoiceResponseDto invoice)
        {
            container
                .Border(1)
                .BorderColor(BorderBlue)
                .CornerRadius(4)
                .Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3.2f);
                        columns.RelativeColumn(1.5f);
                    });

                    // HEADER
                    table.Cell()
                        .Background(Navy)
                        .PaddingVertical(6)
                        .AlignCenter()
                        .Text("Description")
                        .Bold()
                        .FontSize(10)
                        .FontColor(Colors.White);

                    table.Cell()
                        .Background(Navy)
                        .PaddingVertical(6)
                        .AlignCenter()
                        .Text(
                            $"Amount ({invoice.Currency})")
                        .Bold()
                        .FontSize(10)
                        .FontColor(Colors.White);

                    // SUBTOTAL
                    SummaryRow(
                        table,
                        "Subtotal",
                        invoice.SubTotal,
                        invoice.Currency);

                    // DISCOUNT
                    SummaryRow(
                        table,
                        "Discount",
                        invoice.DiscountAmount,
                        invoice.Currency);

                    // TAXABLE
                    SummaryRow(
                        table,
                        "Taxable Amount",
                        invoice.TaxableAmount,
                        invoice.Currency);

                    // GST
                    if (invoice.TaxType ==
                        InvoiceTaxType.IntraState)
                    {
                        SummaryRow(
                            table,
                            $"CGST @ {invoice.CgstRate:0.##}%",
                            invoice.CgstAmount,
                            invoice.Currency);

                        SummaryRow(
                            table,
                            $"SGST @ {invoice.SgstRate:0.##}%",
                            invoice.SgstAmount,
                            invoice.Currency);
                    }
                    else if (invoice.TaxType ==
                             InvoiceTaxType.InterState)
                    {
                        SummaryRow(
                            table,
                            $"IGST @ {invoice.IgstRate:0.##}%",
                            invoice.IgstAmount,
                            invoice.Currency);
                    }
                    else if (
                        invoice.TaxType !=
                            InvoiceTaxType.None &&
                        invoice.TaxAmount > 0)
                    {
                        SummaryRow(
                            table,
                            $"Tax @ {invoice.TaxPercentage:0.##}%",
                            invoice.TaxAmount,
                            invoice.Currency);
                    }

                    // GRAND TOTAL
                    table.Cell()
                        .Background(Gold)
                        .PaddingHorizontal(8)
                        .PaddingVertical(8)
                        .AlignRight()
                        .Text("Grand Total")
                        .Bold()
                        .FontSize(13)
                        .FontColor(NavyDark);

                    table.Cell()
                        .Background(Gold)
                        .PaddingHorizontal(8)
                        .PaddingVertical(8)
                        .AlignRight()
                        .Text(
                            FormatMoney(
                                invoice.TotalAmount,
                                invoice.Currency))
                        .Bold()
                        .FontSize(13)
                        .FontColor(NavyDark);
                });
        }

        private static void SummaryRow(
            TableDescriptor table,
            string label,
            decimal amount,
            string currency)
        {
            table.Cell()
                .Background(LightBlue)
                .BorderTop(1)
                .BorderColor(BorderBlue)
                .PaddingHorizontal(8)
                .PaddingVertical(5)
                .AlignRight()
                .Text(label)
                .Bold()
                .FontSize(9);

            table.Cell()
                .Background(Colors.White)
                .BorderTop(1)
                .BorderColor(BorderBlue)
                .PaddingHorizontal(8)
                .PaddingVertical(5)
                .AlignRight()
                .Text(
                    FormatMoney(
                        amount,
                        currency))
                .Bold()
                .FontSize(9);
        }

        // =====================================================
        // PAYMENT DETAILS
        // =====================================================

        private static void ComposePaymentDetails(
            IContainer container,
            InvoiceResponseDto invoice)
        {
            ComposeInfoBox(
                container,
                "PAYMENT DETAILS",
                content =>
                {
                    var isPaid =
                        invoice.Status ==
                            InvoiceStatus.Paid ||
                        invoice.BalanceAmount <= 0;

                    content.Item()
                        .PaddingBottom(4)
                        .Row(row =>
                        {
                            row.ConstantItem(88)
                                .Text("Payment Status :")
                                .Bold();

                            if (isPaid)
                            {
                                row.ConstantItem(52)
                                    .Background(PaidGreen)
                                    .CornerRadius(4)
                                    .PaddingVertical(3)
                                    .AlignCenter()
                                    .Text("Paid")
                                    .Bold()
                                    .FontColor(Colors.White);
                            }
                            else
                            {
                                row.RelativeItem()
                                    .Text(
                                        invoice.Status.ToString());
                            }
                        });

                    InfoRow(
                        content,
                        "Amount Paid",
                        FormatMoney(
                            invoice.PaidAmount,
                            invoice.Currency));

                    InfoRow(
                        content,
                        "Balance",
                        FormatMoney(
                            invoice.BalanceAmount,
                            invoice.Currency));

                    InfoRow(
                        content,
                        "Payment Mode",
                        string.IsNullOrWhiteSpace(
                            invoice.PaymentMode)
                            ? "Not available"
                            : invoice.PaymentMode);

                    InfoRow(
                        content,
                        "Transaction / UTR",
                        string.IsNullOrWhiteSpace(
                            invoice.TransactionReference)
                            ? "Not available"
                            : invoice.TransactionReference);

                    InfoRow(
                        content,
                        "Payment Date",
                        invoice.PaidDate.HasValue
                            ? invoice.PaidDate.Value
                                .ToString("dd-MMM-yyyy")
                            : "Not available");
                });
        }

        // =====================================================
        // TERMS
        // =====================================================

        private static void ComposeTerms(
            IContainer container,
            InvoiceResponseDto invoice)
        {
            ComposeInfoBox(
                container,
                "TERMS / NOTES",
                content =>
                {
                    Bullet(
                        content,
                        "This is a computer-generated education fee invoice.");

                    Bullet(
                        content,
                        "Tax information is based on the invoice tax configuration.");

                    Bullet(
                        content,
                        "Payment reference is updated after successful payment.");

                    Bullet(
                        content,
                        "Please retain this invoice for your records.");

                    Bullet(
                        content,
                        "Fees once paid are non-refundable.");

                    Bullet(
                        content,
                        "Course access will be activated after successful payment.");

                    var contact =
                        BuildContactText(invoice);

                    Bullet(
                        content,
                        $"For queries, contact {contact}.");

                    if (!string.IsNullOrWhiteSpace(
                        invoice.Notes))
                    {
                        content.Item()
                            .PaddingTop(3)
                            .Text(
                                $"Note: {invoice.Notes}")
                            .FontSize(8.2f);
                    }
                });
        }

        private static void Bullet(
            ColumnDescriptor column,
            string text)
        {
            column.Item()
                .PaddingBottom(2)
                .Row(row =>
                {
                    row.ConstantItem(9)
                        .Text("•")
                        .Bold()
                        .FontSize(9);

                    row.RelativeItem()
                        .Text(text)
                        .FontSize(8.2f);
                });
        }

        // =====================================================
        // FOOTER
        // =====================================================

        private static void ComposeFooter(
            IContainer container,
            InvoiceResponseDto invoice)
        {
            container.Column(column =>
            {
                column.Item()
                    .LineHorizontal(1)
                    .LineColor(Navy);

                column.Item()
                    .PaddingTop(6)
                    .AlignCenter()
                    .Text(
                        $"Thank you for choosing " +
                        $"{GetOrganizationName(invoice)}.")
                    .Bold()
                    .FontSize(10.5f)
                    .FontColor(NavyDark);

                column.Item()
                    .PaddingTop(2)
                    .AlignCenter()
                    .Text(
                        BuildFooterContact(invoice))
                    .FontSize(8.3f)
                    .FontColor(MutedText);

                column.Item()
                    .PaddingTop(2)
                    .AlignCenter()
                    .Text(
                        "This is a computer-generated document " +
                        "and does not require a signature.")
                    .FontSize(7.8f)
                    .FontColor(MutedText);
            });
        }

        // =====================================================
        // LOGO
        // =====================================================

        private byte[]? LoadLogo()
        {
            if (string.IsNullOrWhiteSpace(
                _environment.WebRootPath))
            {
                return null;
            }

            var candidates =
                new[]
                {
                    Path.Combine(
                        _environment.WebRootPath,
                        "Images",
                        "logo.png"),

                    Path.Combine(
                        _environment.WebRootPath,
                        "images",
                        "logo.png")
                };

            var logoPath =
                candidates.FirstOrDefault(
                    File.Exists);

            return logoPath == null
                ? null
                : File.ReadAllBytes(logoPath);
        }

        // =====================================================
        // CONTACT
        // =====================================================

        private static string BuildContactText(
            InvoiceResponseDto invoice)
        {
            var values =
                new[]
                {
                    invoice.OrganizationEmail,
                    invoice.OrganizationPhone,
                    invoice.OrganizationWebsite
                }
                .Where(v =>
                    !string.IsNullOrWhiteSpace(v))
                .ToArray();

            return values.Length == 0
                ? "the organization support team"
                : string.Join(" | ", values);
        }

        private static string BuildFooterContact(
            InvoiceResponseDto invoice)
        {
            var values =
                new[]
                {
                    invoice.OrganizationEmail,
                    invoice.OrganizationPhone,
                    invoice.OrganizationWebsite
                }
                .Where(v =>
                    !string.IsNullOrWhiteSpace(v))
                .ToArray();

            return values.Length == 0
                ? "Organization contact information is not configured"
                : string.Join("  |  ", values);
        }

        private static string GetOrganizationName(
            InvoiceResponseDto invoice)
        {
            return string.IsNullOrWhiteSpace(
                invoice.OrganizationName)
                    ? "the organization"
                    : invoice.OrganizationName;
        }

        // =====================================================
        // MONEY FORMAT
        // =====================================================

        private static string FormatMoney(
            decimal amount,
            string? currency)
        {
            var code =
                string.IsNullOrWhiteSpace(currency)
                    ? "INR"
                    : currency
                        .Trim()
                        .ToUpperInvariant();

            return code switch
            {
                "INR" =>
                    $"₹{amount:N2}",

                "USD" =>
                    $"${amount:N2}",

                "EUR" =>
                    $"€{amount:N2}",

                "GBP" =>
                    $"£{amount:N2}",

                _ =>
                    $"{code} {amount:N2}"
            };
        }
    }
}