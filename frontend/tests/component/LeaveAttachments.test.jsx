import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import LeaveAttachments from '@features/hr/components/LeaveAttachments'
afterEach(cleanup)
it('offers the returned medical PDF for HR review', () => {
  render(<LeaveAttachments value={{ attachments: [{ fileName: 'Medical certificate.pdf', fileUrl: 'https://files.example.test/medical.pdf' }] }} />)
  expect(screen.getByRole('link', { name: /View document: Medical certificate.pdf/ })).toHaveAttribute('href', 'https://files.example.test/medical.pdf')
})
it('handles PascalCase document URLs and removes duplicates', () => {
  render(<LeaveAttachments value={{ DocumentUrl: 'https://files.example.test/proof.pdf', attachments: ['https://files.example.test/proof.pdf'] }} />)
  expect(screen.getAllByRole('link')).toHaveLength(1)
})
it('does not expose executable document URLs', () => {
  render(<LeaveAttachments value={{ attachmentUrl: 'javascript:alert(1)' }} />)
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
  expect(screen.getByText(/No supporting documents/)).toBeInTheDocument()
})
