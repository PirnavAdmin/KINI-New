using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Models;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Repositories
{
    public class InvoiceRepository : IInvoiceRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ITenantContext _tenantContext;

        public InvoiceRepository(
            ApplicationDbContext context,
            ITenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        private int OrganizationId =>
            _tenantContext.OrganizationId;

        // =====================================================
        // GET ALL
        // =====================================================

        public async Task<(IEnumerable<Invoice> Invoices, int TotalCount)>
            GetAllAsync(
                string? search,
                InvoiceStatus? status,
                int? studentId,
                int? courseId,
                DateTime? fromDate,
                DateTime? toDate,
                string? sortBy,
                string? sortOrder,
                int page,
                int pageSize)
        {
            IQueryable<Invoice> query =
                _context.Invoices
                    .AsNoTracking()
                    .Where(i =>
                        i.OrganizationId == OrganizationId &&
                        !i.IsDeleted)
                    .Include(i => i.Student)
                        .ThenInclude(s => s.Batch)
                    .Include(i => i.Course)
                    .Include(i => i.Organization)
                        .ThenInclude(o => o.Branches);

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(i =>
                    i.InvoiceNumber.Contains(search) ||
                    i.Student.FirstName.Contains(search) ||
                    i.Student.LastName.Contains(search) ||
                    i.Student.Email.Contains(search) ||
                    i.Course.CourseName.Contains(search) ||
                    i.Course.CourseCode.Contains(search));
            }

            if (status.HasValue)
            {
                query = query.Where(i =>
                    i.Status == status.Value);
            }

            if (studentId.HasValue)
            {
                query = query.Where(i =>
                    i.StudentId == studentId.Value);
            }

            if (courseId.HasValue)
            {
                query = query.Where(i =>
                    i.CourseId == courseId.Value);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(i =>
                    i.IssueDate >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                var endDate = toDate.Value.Date.AddDays(1);

                query = query.Where(i =>
                    i.IssueDate < endDate);
            }

            var descending =
                string.Equals(
                    sortOrder,
                    "desc",
                    StringComparison.OrdinalIgnoreCase);

            switch ((sortBy ?? "IssueDate").ToLowerInvariant())
            {
                case "amount":

                    query = descending
                        ? query.OrderByDescending(i => i.TotalAmount)
                        : query.OrderBy(i => i.TotalAmount);

                    break;

                case "duedate":

                    query = descending
                        ? query.OrderByDescending(i => i.DueDate)
                        : query.OrderBy(i => i.DueDate);

                    break;

                case "student":

                    query = descending
                        ? query.OrderByDescending(i => i.Student.FirstName)
                        : query.OrderBy(i => i.Student.FirstName);

                    break;

                case "status":

                    query = descending
                        ? query.OrderByDescending(i => i.Status)
                        : query.OrderBy(i => i.Status);

                    break;

                default:

                    query = descending
                        ? query.OrderByDescending(i => i.IssueDate)
                        : query.OrderBy(i => i.IssueDate);

                    break;
            }

            var totalRecords =
                await query.CountAsync();

            var invoices =
                await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

            return (invoices, totalRecords);
        }

        // =====================================================
        // GET BY ID
        // =====================================================

        public async Task<Invoice?> GetByIdAsync(int id)
        {
            return await _context.Invoices
                .Include(i => i.Student)
                    .ThenInclude(s => s.Batch)
                .Include(i => i.Course)
                .Include(i => i.Organization)
                    .ThenInclude(o => o.Branches)
                .FirstOrDefaultAsync(i =>
                    i.InvoiceId == id &&
                    i.OrganizationId == OrganizationId &&
                    !i.IsDeleted);
        }

        // =====================================================
        // CREATE
        // =====================================================

        public async Task<Invoice> CreateAsync(Invoice invoice)
        {
            invoice.OrganizationId = OrganizationId;

            await _context.Invoices.AddAsync(invoice);

            await _context.SaveChangesAsync();

            return invoice;
        }

        // =====================================================
        // UPDATE
        // =====================================================

        public async Task<bool> UpdateAsync(Invoice invoice)
        {
            var existing =
                await _context.Invoices.FirstOrDefaultAsync(i =>
                    i.InvoiceId == invoice.InvoiceId &&
                    i.OrganizationId == OrganizationId &&
                    !i.IsDeleted);

            if (existing == null)
                return false;

            existing.BillingAddress = invoice.BillingAddress;
            existing.PlaceOfSupply = invoice.PlaceOfSupply;
            existing.Currency = invoice.Currency;
            existing.TaxType = invoice.TaxType;

            existing.SubTotal = invoice.SubTotal;
            existing.DiscountAmount = invoice.DiscountAmount;
            existing.TaxableAmount = invoice.TaxableAmount;
            existing.TaxPercentage = invoice.TaxPercentage;
            existing.TaxAmount = invoice.TaxAmount;
            existing.TotalAmount = invoice.TotalAmount;

            existing.PaidAmount = invoice.PaidAmount;
            existing.BalanceAmount = invoice.BalanceAmount;

            existing.DueDate = invoice.DueDate;
            existing.Notes = invoice.Notes;

            existing.Status = invoice.Status;
            existing.PaidDate = invoice.PaidDate;
            existing.CancelledDate = invoice.CancelledDate;
            existing.CancellationReason =
                invoice.CancellationReason;

            existing.InvoiceNumber =
                invoice.InvoiceNumber;

            return await _context.SaveChangesAsync() > 0;
        }

        // =====================================================
        // STUDENT EXISTS
        // =====================================================

        public async Task<bool> StudentExistsAsync(int studentId)
        {
            return await _context.Students.AnyAsync(s =>
                s.StudentId == studentId &&
                s.OrganizationId == OrganizationId &&
                !s.IsDeleted);
        }

        // =====================================================
        // COURSE EXISTS
        // =====================================================

        public async Task<bool> CourseExistsAsync(int courseId)
        {
            return await _context.Courses.AnyAsync(c =>
                c.CourseId == courseId &&
                c.OrganizationId == OrganizationId);
        }

        // =====================================================
        // INVOICE NUMBER EXISTS
        // =====================================================

        public async Task<bool> InvoiceNumberExistsAsync(
            string invoiceNumber)
        {
            return await _context.Invoices.AnyAsync(i =>
                i.OrganizationId == OrganizationId &&
                i.InvoiceNumber == invoiceNumber);
        }

        // =====================================================
        // SAVE
        // =====================================================

        public async Task<bool> SaveAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}