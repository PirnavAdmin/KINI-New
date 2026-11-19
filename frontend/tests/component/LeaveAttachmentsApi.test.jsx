import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  upload: vi.fn(),
  fetchFile: vi.fn(),
  triggerFileDownload: vi.fn(),
}))

vi.mock('@shared/services/leaveAttachmentService', () => ({
  default: { list: mocks.list, upload: mocks.upload, fetchFile: mocks.fetchFile },
}))
vi.mock('@shared/utils/download', () => ({ triggerFileDownload: mocks.triggerFileDownload }))

const { default: LeaveAttachments } = await import('@features/hr/components/LeaveAttachments')

const stored = {
  attachmentId: 9, leaveId: 2, fileName: 'medical.pdf', contentType: 'application/pdf', fileSize: 20480,
  viewUrl: '/api/hr/leave/attachments/9/view', downloadUrl: '/api/hr/leave/attachments/9/download',
}

beforeEach(() => Object.values(mocks).forEach(fn => fn.mockReset()))
afterEach(cleanup)

it('HR downloads a stored document through the authenticated API, not a bare link', async () => {
  const blob = new Blob(['%PDF-1.7'], { type: 'application/pdf' })
  mocks.fetchFile.mockResolvedValue(blob)
  render(<LeaveAttachments value={{ leaveId: 2, attachments: [stored] }} />)

  expect(screen.getByText('medical.pdf')).toBeInTheDocument()
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: /Download/ }))
  await waitFor(() => expect(mocks.fetchFile).toHaveBeenCalledWith(expect.objectContaining({ attachmentId: 9 }), 'download'))
  expect(mocks.triggerFileDownload).toHaveBeenCalledWith(blob, 'medical.pdf')
})

it("loads the mentor's own documents by leave id and uploads a new one", async () => {
  mocks.list.mockResolvedValue([])
  mocks.upload.mockResolvedValue(stored)
  render(<LeaveAttachments value={{ id: 2 }} leaveId={2} allowUpload />)

  expect(await screen.findByText(/No supporting documents/)).toBeInTheDocument()
  expect(mocks.list).toHaveBeenCalledWith(2, expect.anything())

  const file = new File(['%PDF-1.7'], 'medical.pdf', { type: 'application/pdf' })
  fireEvent.change(screen.getByLabelText('Choose a supporting document'), { target: { files: [file] } })
  await waitFor(() => expect(mocks.upload).toHaveBeenCalledWith(2, file))
  expect(await screen.findByText('medical.pdf')).toBeInTheDocument()
})

it('refuses unsupported files before uploading', async () => {
  mocks.list.mockResolvedValue([])
  render(<LeaveAttachments value={{ id: 2 }} leaveId={2} allowUpload />)
  await screen.findByText(/No supporting documents/)
  const file = new File(['MZ'], 'tool.exe', { type: 'application/x-msdownload' })
  fireEvent.change(screen.getByLabelText('Choose a supporting document'), { target: { files: [file] } })
  expect(await screen.findByRole('alert')).toHaveTextContent(/PDF, JPG or PNG/)
  expect(mocks.upload).not.toHaveBeenCalled()
})
