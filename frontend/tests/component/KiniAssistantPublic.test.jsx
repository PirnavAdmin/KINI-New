import { afterEach, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook, render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useKiniAssistantState } from '@features/kini-assistant/hooks/useKiniAssistant'
import { buildSmartActions } from '@features/kini-assistant/services/intentEngine'
import { askKiniAssistant, getAssistantGreeting } from '@shared/services/kiniAssistantService'
import { courseService } from '@shared/services/courseService'
import { sendPrompt } from '@shared/services/ai.service'
import KiniAssistant from '@features/kini-assistant/components/KiniAssistant'

const auth = vi.hoisted(() => ({ user: null, role: 'org-admin', isAuthenticated: false, loading: false }))
vi.mock('@shared/hooks/useAuth', () => ({ useAuth: () => auth }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => true }) }))
vi.mock('@shared/services/courseService', () => ({ courseService: { getPublicCourses: vi.fn() } }))
vi.mock('@shared/services/ai.service', () => ({ sendPrompt: vi.fn() }))
vi.mock('@features/kini-assistant/components/ChatWindow', async () => {
  const { useAssistantContext } = await import('@features/kini-assistant/contexts/AssistantContext')
  return { default: function SessionProbe() {
    const chat = useAssistantContext()
    return <div><p>{chat.messages.map(message => message.content).join(' ')}</p><button onClick={() => chat.setMessages([{ id: 'private', role: 'assistant', content: 'PRIVATE SIGNED-IN CONTENT' }])}>Set private message</button></div>
  } }
})
afterEach(() => { cleanup(); localStorage.clear(); vi.clearAllMocks(); Object.assign(auth, { user: null, role: 'org-admin', isAuthenticated: false, loading: false }) })

it('overrides the default organization role when unauthenticated or loading', () => {
  const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>
  const { result, rerender } = renderHook(useKiniAssistantState, { wrapper })
  expect(result.current.role).toBe('guest')
  expect(result.current.suggestedActions.map(action => action.label)).toEqual(['What courses are available?', 'How do I enroll?', 'Can I talk to an advisor?', 'How do I contact Kini?'])
  Object.assign(auth, { user: { id: 42 }, isAuthenticated: true, loading: true })
  rerender()
  expect(result.current.role).toBe('guest')
})
it('keeps typed private intents from producing guest admin suggestions', () => {
  expect(buildSmartActions('guest', 'organization reports').map(action => action.label)).not.toContain('Show Employees')
  expect(getAssistantGreeting({ role: 'org-admin', isAuthenticated: false })).toContain('Hi! I’m the Kini Assistant.')
})
it('refuses guest private queries without asking the AI or fetching courses', async () => {
  const result = await askKiniAssistant({ prompt: 'Show employees', role: 'org-admin', isAuthenticated: false })
  expect(result.answer).toContain('authorized account')
  expect(sendPrompt).not.toHaveBeenCalled()
  expect(courseService.getPublicCourses).not.toHaveBeenCalled()
})
it('uses only the selected public course and never enrollment form values', async () => {
  courseService.getPublicCourses.mockResolvedValue({ data: [{ id: 5, name: 'React', price: 25000, internalNotes: 'PRIVATE' }, { id: 6, name: 'Python', price: 10000 }] })
  sendPrompt.mockResolvedValue('The published fee is 25000.')
  await askKiniAssistant({ prompt: 'What is this course fee?', enrollmentCourseId: '5', role: 'guest', isAuthenticated: false, user: { phone: 'SECRET' } })
  const payload = sendPrompt.mock.calls[0][0]
  expect(payload).toContain('25000')
  expect(payload).toContain('React')
  expect(payload).not.toMatch(/PRIVATE|SECRET|Python/)
})
it('clears signed-in messages when signing out', () => {
  Object.assign(auth, { user: { id: 42 }, role: 'student', isAuthenticated: true })
  const { rerender } = render(<MemoryRouter><KiniAssistant /></MemoryRouter>)
  fireEvent.click(screen.getByRole('button', { name: 'Set private message' }))
  expect(screen.getByText('PRIVATE SIGNED-IN CONTENT')).toBeInTheDocument()
  Object.assign(auth, { user: null, isAuthenticated: false })
  rerender(<MemoryRouter><KiniAssistant /></MemoryRouter>)
  expect(screen.queryByText('PRIVATE SIGNED-IN CONTENT')).not.toBeInTheDocument()
  expect(screen.getByText(/Hi! I’m the Kini Assistant/)).toBeInTheDocument()
})
it('offers enrollment questions and records an API failure for retry', async () => {
  const wrapper = ({ children }) => <MemoryRouter initialEntries={['/enrollment?courseId=5']}>{children}</MemoryRouter>
  courseService.getPublicCourses.mockResolvedValue({ data: [] })
  sendPrompt.mockRejectedValue(new Error('Unable to reach the AI service. Please retry.'))
  const { result } = renderHook(useKiniAssistantState, { wrapper })
  expect(result.current.quickPrompts).toContain('What is this course fee?')
  await act(async () => { await result.current.sendMessage('What is this course fee?') })
  expect(result.current.messages.at(-1)).toMatchObject({ status: 'error', prompt: 'What is this course fee?' })
  sendPrompt.mockResolvedValue('Please contact an advisor for current pricing.')
  await act(async () => { await result.current.retryMessage(result.current.messages.at(-1)) })
  expect(result.current.messages.at(-1).content).toContain('advisor')
})
