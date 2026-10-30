export const resolveInvoiceStatus = (invoice = {}) => {
  const backendStatus = String(invoice.paymentStatus ?? invoice.status ?? '').trim()
  const normalizedStatus = backendStatus.toLowerCase()
  if (normalizedStatus === 'paid') return 'Paid'
  if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') return 'Cancelled'

  const total = Number(invoice.totalAmount ?? invoice.grandTotal ?? invoice.total ?? 0)
  const paid = Number(invoice.paidAmount ?? invoice.amountPaid ?? invoice.paid ?? 0)
  if (total > 0 && paid >= total) return 'Paid'

  const dueDateValue = invoice.dueDate ? new Date(invoice.dueDate) : null
  if (dueDateValue && !Number.isNaN(dueDateValue.getTime())) {
    const dueDate = new Date(dueDateValue.getFullYear(), dueDateValue.getMonth(), dueDateValue.getDate())
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (dueDate < today && paid < total) return 'Overdue'
  }

  if (normalizedStatus === 'overdue') return 'Overdue'
  return 'Pending'
}

export const normalizeInvoice = (invoice = {}) => ({
  ...invoice,
  invoiceId: invoice.localOnly ? null : (invoice.invoiceId ?? invoice.id),
  id: invoice.invoiceNumber ?? invoice.invoiceNo ?? (String(invoice.id ?? '').startsWith('INV-') ? invoice.id : `INV-${invoice.invoiceId ?? invoice.id}`),
  localOnly: Boolean(invoice.localOnly),
  customerName: invoice.customerName ?? invoice.studentName ?? invoice.recipientName ?? 'Customer',
  customerEmail: invoice.customerEmail ?? invoice.studentEmail ?? invoice.email ?? '',
  courseName: invoice.courseName ?? invoice.serviceName ?? 'Course fee',
  amount: Number(invoice.subTotal ?? invoice.subtotal ?? invoice.amount ?? 0),
  discount: Number(invoice.discountAmount ?? invoice.discount ?? 0),
  tax: Number(invoice.taxAmount ?? invoice.tax ?? 0),
  total: Number(invoice.totalAmount ?? invoice.grandTotal ?? invoice.total ?? 0),
  paid: Number(invoice.paidAmount ?? invoice.amountPaid ?? invoice.paid ?? 0),
  status: resolveInvoiceStatus(invoice),
  paymentStatus: invoice.paymentStatus ?? invoice.status ?? resolveInvoiceStatus(invoice),
  taxRate: invoice.taxPercentage ?? invoice.taxRate ?? null,
  balanceDue: Number(invoice.balanceDue ?? invoice.balanceAmount ?? Math.max(0, Number(invoice.totalAmount ?? invoice.grandTotal ?? invoice.total ?? 0) - Number(invoice.paidAmount ?? invoice.amountPaid ?? invoice.paid ?? 0))),
  invoiceDate: String(invoice.invoiceDate ?? invoice.createdAt ?? '').slice(0, 10),
  dueDate: String(invoice.dueDate ?? '').slice(0, 10),
  emailSent: Boolean(invoice.emailSent ?? invoice.isEmailSent ?? invoice.sentAt ?? invoice.emailSentAt),
})
