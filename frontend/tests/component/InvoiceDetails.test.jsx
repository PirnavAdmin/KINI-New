import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import InvoiceDetailsModal from '../../src/features/organization/components/InvoiceDetailsModal';
import { normalizeInvoice, resolveInvoiceStatus } from '../../src/features/organization/utils/invoicePresentation';

HTMLElement.prototype.scrollTo = vi.fn();

const reference = { invoiceId: 2, invoiceNumber: 'INV-20260908-000002', studentName: 'Hari Krishna',
  courseName: 'Node.js', subTotal: 4500, totalAmount: 4500, paidAmount: 0, taxPercentage: 0,
  taxAmount: 0, status: 'PENDING', dueDate: '2026-09-08', invoiceDate: '2026-09-08' };

it('keeps the server payment state and tax rate while deriving overdue separately', () => {
  const invoice = normalizeInvoice(reference);
  expect(invoice.paymentStatus).toBe('PENDING');
  expect(invoice.taxRate).toBe(0);
  expect(invoice.balanceDue).toBe(4500);
  expect(resolveInvoiceStatus({ ...reference, dueDate: '2020-01-01' })).toBe('Overdue');
  expect(resolveInvoiceStatus({ ...reference, status: 'Paid', dueDate: '2020-01-01' })).toBe('Paid');
  expect(resolveInvoiceStatus({ ...reference, paidAmount: 4500 })).toBe('Paid');
  expect(resolveInvoiceStatus({ ...reference, status: 'Cancelled' })).toBe('Cancelled');
});
it('renders real amounts, closes, and passes the selected invoice to PDF download', async () => {
  const invoice = normalizeInvoice(reference), close = vi.fn(), download = vi.fn().mockResolvedValue();
  render(<InvoiceDetailsModal invoice={invoice} open onClose={close} onDownload={download} />);
  // Labels mirror the generated invoice PDF.
  expect(screen.getByText('Tax @ 0%')).toBeInTheDocument();
  expect(screen.queryByText('Tax @ 18%')).not.toBeInTheDocument();
  expect(screen.getByText('PENDING')).toBeInTheDocument();
  expect(screen.getByText('Balance :')).toBeInTheDocument();
  expect(screen.getByText('Transaction / UTR :')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
  await waitFor(() => expect(download).toHaveBeenCalledWith(invoice));
  fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
  expect(close).toHaveBeenCalled();
});
