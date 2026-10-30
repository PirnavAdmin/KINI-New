import invoiceService from './invoiceService';
import { paymentApi } from './apiServices';

const rowsFrom = value => {
  const rows = value?.data ?? value?.items ?? value?.records ?? value;
  return Array.isArray(rows) ? rows : [];
};
export const paymentMethodLabel = row => String(row.paymentMethod ?? row.method ?? '').trim() || 'Not available';
export const paymentStatusLabel = row => String(row.paymentStatus ?? row.status ?? '').trim() || 'Not available';
export const normalizeStudentPayment = row => ({
  ...row,
  number: row.receiptNumber ?? row.invoiceNumber ?? row.paymentId ?? row.id ?? 'Not available',
  date: row.paymentDate ?? row.paidAt ?? row.createdAt ?? '',
  amount: row.amount ?? row.paidAmount ?? row.totalAmount ?? row.grandTotal ?? null,
  method: paymentMethodLabel(row),
  status: paymentStatusLabel(row),
  transactionId: row.transactionId ?? row.paymentId ?? 'Not available',
});
export async function loadStudentPayments(studentId, userId) {
  // Swagger confirms /payments/history accepts userId, NOT studentId.
  // Never substitute the student id or issue an unscoped history request.
  if (userId != null && String(userId).trim()) {
    const rows = rowsFrom(await paymentApi.paymentHistory({ userId }));
    const owned = rows.filter(row => {
      const owner = row.studentId ?? row.student?.studentId;
      return (owner == null || String(owner) === String(studentId))
        && (row.userId == null || String(row.userId) === String(userId));
    });
    if (owned.length) return owned.map(normalizeStudentPayment);
  }
  const invoices = rowsFrom(await invoiceService.list({ studentId }));
  return invoices.filter(row => {
    const owner = row.studentId ?? row.StudentId ?? row.student?.studentId ?? row.student?.id;
    return owner != null && String(owner) === String(studentId);
  }).map(normalizeStudentPayment);
}
