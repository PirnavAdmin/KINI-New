import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

vi.mock('@shared/services/leaveAttachmentService', () => ({
  default: { list: vi.fn(), upload: vi.fn(), fetchFile: vi.fn() },
}))

const { default: HrLeaveDetails } = await import('@features/hr/components/HrLeaveDetails')

afterEach(cleanup)

const leave = {
  leaveId: 3, employeeId: 'EMP-001', employeeName: 'MAHESH MAHI', email: 'mahesh@example.com',
  leaveType: 'Sick', fromDate: '2026-11-18', toDate: '2026-11-19', days: 2, reason: 'Fever',
  status: 'PENDING', appliedOn: '2026-11-18T07:21:10.181604', approvedBy: null, approvedOn: null,
  profilePhotoUrl: null, rejectionReason: null,
  attachments: [{
    attachmentId: 9, leaveId: 3, fileName: 'WhatsApp Image.jpeg', contentType: 'image/jpeg', fileSize: 88064,
    viewUrl: '/api/hr/leave/attachments/9/view', downloadUrl: '/api/hr/leave/attachments/9/download',
  }],
}

it('shows employee and status cards with formatted values and the documents', () => {
  const onClose = vi.fn()
  render(<HrLeaveDetails value={leave} leaveId={3} onClose={onClose} />)

  expect(screen.getByRole('heading', { name: 'Leave Details' })).toBeInTheDocument()
  const employee = screen.getByRole('region', { name: 'Employee Information' })
  expect(within(employee).getByText('MAHESH MAHI')).toBeInTheDocument()
  expect(within(employee).getByText('Sick')).toBeInTheDocument()
  expect(within(employee).getByRole('link', { name: /mahesh@example.com/ })).toHaveAttribute('href', 'mailto:mahesh@example.com')

  const status = screen.getByRole('region', { name: 'Leave Status & Approval' })
  expect(within(status).getByText('PENDING')).toBeInTheDocument()
  expect(within(status).getByText('18 Nov 2026')).toBeInTheDocument()
  expect(within(status).getByText('2 days')).toBeInTheDocument()
  expect(within(status).queryByText('Rejection Reason')).not.toBeInTheDocument()
  expect(screen.queryByText(/Profile Photo/i)).not.toBeInTheDocument()       // raw field not shown
  expect(screen.queryByText(/2026-11-18T07/)).not.toBeInTheDocument()        // no raw timestamp

  expect(screen.getByText('WhatsApp Image.jpeg')).toBeInTheDocument()
  expect(screen.getByText('86 KB')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /View/ })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Download/ })).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Close leave details' }))
  expect(onClose).toHaveBeenCalled()
})

it('shows who rejected and why for a rejected leave', () => {
  render(<HrLeaveDetails value={{ ...leave, status: 'REJECTED', approvedBy: 'HR Admin', approvedOn: '2026-11-18T09:00:00', rejectionReason: 'Overlaps exam week', attachments: [] }} leaveId={3} onClose={() => {}} />)
  const status = screen.getByRole('region', { name: 'Leave Status & Approval' })
  expect(within(status).getByText('Rejected By')).toBeInTheDocument()
  expect(within(status).getByText('HR Admin')).toBeInTheDocument()
  expect(within(status).getByText('Overlaps exam week')).toBeInTheDocument()
})
