import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { useConversationMessages } from '@shared/hooks/useConversationMessages'
import * as chat from '@shared/services/chatService'

vi.mock('@shared/services/chatService', () => ({
  getMessages: vi.fn(), markConversationRead: vi.fn(), sendMessage: vi.fn(),
  deleteAttachment: vi.fn(), uploadAttachment: vi.fn(),
}))
vi.mock('react-hot-toast', () => ({ default: Object.assign(vi.fn(), { error: vi.fn() }) }))
const message = (id, conversationId) => ({ messageId: id, conversationId, message: 'Hello', senderType: 'Student' })
const deferred = () => { let resolve; const promise = new Promise((done) => { resolve = done }); return { promise, resolve } }

beforeEach(() => { vi.resetAllMocks(); chat.getMessages.mockResolvedValue([]); chat.markConversationRead.mockResolvedValue({}) })
afterEach(() => { vi.useRealTimers() })

describe('conversation isolation and persistence', () => {
  it('ignores a previous conversation response after selection changes', async () => {
    const old = deferred()
    chat.getMessages.mockImplementation((id) => id === 1 ? old.promise : Promise.resolve([message(22, 2)]))
    const { result, rerender } = renderHook(({ id }) => useConversationMessages(id), { initialProps: { id: 1 } })
    rerender({ id: 2 })
    await waitFor(() => expect(result.current.messages[0]?.id).toBe(22))
    await act(async () => old.resolve([message(11, 1)]))
    expect(result.current.messages[0].id).toBe(22)
    expect(chat.markConversationRead).not.toHaveBeenCalledWith(1)
  })

  it('does not overlap polls or keep polling after unmount', async () => {
    vi.useFakeTimers()
    const pending = deferred()
    chat.getMessages.mockReturnValue(pending.promise)
    const { unmount } = renderHook(() => useConversationMessages(1))
    await act(async () => { await vi.advanceTimersByTimeAsync(24000) })
    expect(chat.getMessages).toHaveBeenCalledTimes(1)
    unmount()
    await act(async () => { pending.resolve([]); await vi.advanceTimersByTimeAsync(24000) })
    expect(chat.getMessages).toHaveBeenCalledTimes(1)
    expect(chat.markConversationRead).not.toHaveBeenCalled()
  })

  it('replaces a sent response with the persisted server snapshot without duplicates', async () => {
    const saved = message(10, 1)
    chat.sendMessage.mockResolvedValue(saved)
    chat.getMessages.mockResolvedValueOnce([]).mockResolvedValue([saved])
    const { result } = renderHook(() => useConversationMessages(1, undefined, 'student'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => { await result.current.send('Hello') })
    expect(result.current.messages.map((row) => row.id)).toEqual([10])
    expect(chat.sendMessage).toHaveBeenCalledWith(1, 'Hello')
  })

  it('renders persisted attachment metadata and allows subsequent uploads without duplicate message posts', async () => {
    chat.uploadAttachment.mockResolvedValue({ attachmentId: 42, conversationId: 1 })
    const saved = { ...message(10, 1), attachment: { attachmentId: 42, messageId: null, originalFileName: 'test.pdf', fileName: 'stored.pdf', fileType: 'application/pdf', fileSize: 3 } }
    chat.getMessages.mockResolvedValueOnce([]).mockResolvedValue([saved])
    const { result } = renderHook(() => useConversationMessages(1))
    await waitFor(() => expect(result.current.loading).toBe(false))
    const file = new File(['pdf'], 'test.pdf')
    await act(async () => { await result.current.sendAttachment(file) })
    expect(chat.uploadAttachment).toHaveBeenCalledWith(1, file, '')
    expect(chat.uploadAttachment).toHaveBeenCalledTimes(1)
    expect(chat.sendMessage).not.toHaveBeenCalled()
    expect(result.current.messages[0].attachment).toEqual({ attachmentId: 42, filename: 'test.pdf', contentType: 'application/pdf', size: 3 })
    expect(result.current.uploading).toBe(false)
    await act(async () => { await result.current.sendAttachment(file) })
    expect(chat.uploadAttachment).toHaveBeenCalledTimes(2)
    expect(result.current.messages).toHaveLength(1)
  })

  it('renders existing attachments on load without treating message IDs as attachment IDs', async () => {
    chat.getMessages.mockResolvedValue([{ ...message(1, 3), attachment: null }, { ...message(2, 3), attachment: { attachmentId: 9, originalFileName: 'existing.pdf', fileSize: 12, fileType: 'application/pdf', messageId: null } }])
    const { result } = renderHook(() => useConversationMessages(3))
    await waitFor(() => expect(result.current.messages).toHaveLength(2))
    expect(result.current.messages[0].attachment).toBeNull()
    expect(result.current.messages[1].attachment.attachmentId).toBe(9)
  })

  it('prevents overlapping uploads and releases the lock after failure', async () => {
    const pending = deferred()
    chat.uploadAttachment.mockReturnValueOnce(pending.promise).mockResolvedValue({ attachmentId: 42 })
    chat.getMessages.mockResolvedValue([{ ...message(10, 3), attachment: { attachmentId: 42 } }])
    const { result } = renderHook(() => useConversationMessages(3))
    const file = new File(['pdf'], 'test.pdf')
    let first
    await act(async () => {
      first = result.current.sendAttachment(file)
      await result.current.sendAttachment(file)
    })
    expect(chat.uploadAttachment).toHaveBeenCalledTimes(1)
    expect(result.current.uploading).toBe(true)
    await act(async () => { pending.resolve({ attachmentId: 42 }); await first })
    expect(result.current.uploading).toBe(false)
    chat.uploadAttachment.mockRejectedValueOnce(new Error('Upload failed'))
    await act(async () => { await expect(result.current.sendAttachment(file)).rejects.toThrow('Upload failed') })
    expect(result.current.uploading).toBe(false)
    await act(async () => { await result.current.sendAttachment(file) })
    expect(chat.uploadAttachment).toHaveBeenCalledTimes(3)
  })

  it('links an uploaded PDF through the message API and renders only the persisted result', async () => {
    const saved = { ...message(10, 3), message: '', attachment: { attachmentId: 42, originalFileName: 'new.pdf', fileSize: 3, fileType: 'application/pdf' } }
    chat.getMessages.mockResolvedValueOnce([]).mockResolvedValueOnce([]).mockResolvedValue([saved])
    chat.uploadAttachment.mockResolvedValue({ attachmentId: 42, conversationId: 3 })
    chat.sendMessage.mockResolvedValue(saved)
    const { result } = renderHook(() => useConversationMessages(3))
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => { await result.current.sendAttachment(new File(['pdf'], 'new.pdf')) })
    expect(chat.sendMessage).toHaveBeenCalledWith(3, null, 42)
    expect(chat.sendMessage).toHaveBeenCalledTimes(1)
    expect(result.current.messages[0].attachment.filename).toBe('new.pdf')
  })

  it('retains the uploaded ID on linking failure so retry does not upload the PDF twice', async () => {
    chat.uploadAttachment.mockResolvedValue({ attachmentId: 42 })
    chat.sendMessage.mockRejectedValueOnce(new Error('Link failed')).mockResolvedValue({})
    const { result } = renderHook(() => useConversationMessages(3))
    await waitFor(() => expect(result.current.loading).toBe(false))
    const file = new File(['pdf'], 'new.pdf')
    await act(async () => { await expect(result.current.sendAttachment(file)).rejects.toThrow('Link failed') })
    chat.getMessages.mockResolvedValueOnce([]).mockResolvedValue([{ ...message(10, 3), attachment: { attachmentId: 42 } }])
    await act(async () => { await result.current.sendAttachment(file) })
    expect(chat.uploadAttachment).toHaveBeenCalledTimes(1)
    expect(result.current.messages[0].attachment.attachmentId).toBe(42)
  })
})
