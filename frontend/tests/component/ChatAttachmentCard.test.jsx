import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import ChatAttachmentCard from '@shared/components/ChatAttachmentCard'
import { viewAttachment } from '@shared/services/chatService'
import toast from 'react-hot-toast'

vi.mock('@shared/services/chatService', () => ({ viewAttachment: vi.fn(), downloadAttachment: vi.fn() }))
vi.mock('react-hot-toast', () => ({ default: { error: vi.fn(), success: vi.fn() } }))
const attachment = { attachmentId: 42, filename: 'document.pdf', size: 1024 }
beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:preview'), revokeObjectURL: vi.fn() })
})
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); vi.clearAllMocks() })

it('opens one detached preview, blocks duplicate requests, and releases its URL', async () => {
  const preview = { opener: window, location: { href: '' }, close: vi.fn() }
  vi.spyOn(window, 'open').mockReturnValue(preview)
  let finish
  viewAttachment.mockReturnValue(new Promise((resolve) => { finish = resolve }))
  render(<ChatAttachmentCard attachment={attachment} />)
  fireEvent.click(screen.getByRole('button', { name: 'View document.pdf' }))
  fireEvent.click(screen.getByRole('button', { name: 'View document.pdf' }))
  expect(viewAttachment).toHaveBeenCalledTimes(1)
  expect(viewAttachment).toHaveBeenCalledWith(42)
  expect(preview.opener).toBeNull()
  await act(async () => finish({ blob: new Blob(['pdf'], { type: 'application/pdf' }), contentType: 'application/pdf' }))
  expect(window.open).toHaveBeenCalledTimes(1)
  expect(preview.location.href).toBe('blob:preview')
  act(() => vi.advanceTimersByTime(60000))
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview')
})

it('shows a popup error without fetching a file when the browser blocks the tab', () => {
  vi.spyOn(window, 'open').mockReturnValue(null)
  render(<ChatAttachmentCard attachment={attachment} />)
  fireEvent.click(screen.getByRole('button', { name: 'View document.pdf' }))
  expect(viewAttachment).not.toHaveBeenCalled()
  expect(toast.error).toHaveBeenCalledWith('Allow pop-ups to view this attachment.')
})

it('keeps the attachment visible and reports failure when deletion fails', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  const onDelete = vi.fn().mockRejectedValue({ response: { status: 403 } })
  render(<ChatAttachmentCard attachment={attachment} canDelete onDelete={onDelete} />)
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Delete document.pdf' })))
  expect(onDelete).toHaveBeenCalledTimes(1)
  expect(screen.getByText('document.pdf')).toBeInTheDocument()
  expect(toast.success).not.toHaveBeenCalled()
  expect(toast.error).toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Delete document.pdf' })).not.toBeDisabled()
})
