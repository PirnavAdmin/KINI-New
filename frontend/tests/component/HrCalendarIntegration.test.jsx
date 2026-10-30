import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HrApiModule from '@features/hr/components/HrApiModule'
import apiClient from '@shared/services/apiClient'
import { loadCalendarEvents, calendarDate, normalizeCalendar as normalizeResponse, mergeCalendar, inCalendarMonth, calendarOnDay, calendarStats, calendarMonthMetrics, calendarMonthRange, upcomingCalendarEvents } from '@features/hr/services/hrCalendarData'

vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => true, can: () => true, isLoading: false }) }))
vi.mock('@features/hr/components/HRPage', () => ({ default: ({ children, actions }) => <main>{actions}{children}</main> }))
const base = '/api/hr/calendar'
// Synthetic frontend fixtures, not captured backend responses.
const event = { eventId: 42, title: 'Calendar test', eventType: 'MEETING', startDateTime: '2026-10-02T10:00:00', endDateTime: '2026-10-02T11:00:00', allDay: false }
const holiday = { eventId: 43, title: 'Date-only test', startDateTime: '2026-10-02', endDateTime: '2026-10-02', allDay: true }
// Sanitized, verified Swagger leave DTO supplied for this fix.
const leave = { leaveRequestId: 8, employeeId: 9, employeeName: 'nani narendraaaa', employeeProfilePhotoUrl: null, leaveType: 'Sick', startDate: '2026-10-01T00:00:00', endDate: '2026-10-02T00:00:00', status: 'PENDING', reason: 'emergency' }
const response = data => ({ data: { data }, config: {}, status: 200 })
const normalizeCalendar = (items, source) => normalizeResponse({ items }, source)
let records
beforeEach(() => {
  vi.clearAllMocks(); HTMLElement.prototype.scrollTo = vi.fn(); records = [event]
  vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-10-02T08:00:00').getTime())
  apiClient.request.mockImplementation(async request => {
    const { url, method, data } = request
    if (url === `${base}/events/42`) {
      if (method === 'PUT') records = [{ ...event, ...data }]
      if (method === 'DELETE') records = []
      return response(records[0] ?? {})
    }
    if (url === `${base}/events`) {
      if (method === 'POST') records.push({ eventId: 44, ...data })
      return response({ items: records, totalPages: 1 })
    }
    if (url.endsWith('/stats')) return response({ eventsThisMonth: records.length, classesScheduled: 0, meetings: records.length, holidays: 0, leaveEvents: 0 })
    if (url.endsWith('/upcoming')) return response({ items: records })
    return response({ items: [] })
  })
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })
// The fixtures are in October 2026; Month view shows them whatever today is.
const showMonth = () => fireEvent.click(screen.getByRole('button', { name: 'Month', exact: true }))
const upcomingList = () => document.querySelector('.hcw-upcoming')
async function mount() {
  render(<MemoryRouter><HrApiModule module="calendar" /></MemoryRouter>)
  // The first render of the time grid can be slow on a cold test run.
  await screen.findAllByRole('button', { name: /Calendar test/ }, { timeout: 5000 })
  showMonth()
  return document.querySelector('.hcw-main')
}
it('keeps date-only values local and checks year, types and identity', () => {
  const date = calendarDate('2026-10-02')
  expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 9, 2])
  expect(Number.isNaN(calendarDate('2026-02-30').getTime())).toBe(true)
  const events = normalizeCalendar([event])
  expect(events[0].type).toBe('meetings')
  expect(inCalendarMonth(events[0], new Date(2025, 9, 1))).toBe(false)
  expect(mergeCalendar([events, normalizeCalendar([event])])).toHaveLength(1)
  expect(() => normalizeCalendar([event], 'classes')).toThrow(/verified response DTO/)
  expect(normalizeCalendar([{ ...event, eventType: 'MYSTERY', title: 'Holiday meeting' }])[0].type).toBe('unknown')
  expect(() => normalizeCalendar([{ date: '2026-10-02' }], 'holidays')).toThrow(/verified response DTO/)
})

it('maps organization class schedules, overnight times and class response containers', () => {
  const row = { liveClassId: 101, classTitle: 'Organization React Class', scheduledDate: '2026-10-03', startTime: '23:30:00', endTime: '00:30:00', status: 'Scheduled', batchId: 5 }
  for (const payload of [{ items: [row] }, [row], { classes: [row] }, { data: { liveClasses: [row] } }]) {
    const [mapped] = normalizeResponse(payload, 'classes')
    expect(mapped).toMatchObject({ id: 101, title: row.classTitle, source: 'classes', type: 'classes', allDay: false })
    expect(mapped.start).toEqual(new Date(2026, 9, 3, 23, 30))
    expect(mapped.end).toEqual(new Date(2026, 9, 4, 0, 30))
  }
  expect(() => normalizeResponse({ items: [{ ...row, startTime: '28:00:00' }] }, 'classes')).toThrow(/valid schedule/)
  const [calendarClass] = normalizeCalendar([{ eventId: 77, eventType: 'CLASS', title: 'Calendar class', startDateTime: '2026-10-03T10:00:00', endDateTime: '2026-10-03T11:00:00' }], 'classes')
  expect(calendarClass.type).toBe('classes')
})

it('displays organization-created classes in HR Calendar and reloads them on Refresh', async () => {
  let classTitle = 'Organization React Class'
  const original = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(request => request.url === `${base}/classes`
    ? Promise.resolve(response({ items: [{ liveClassId: 101, classTitle, scheduledDate: '2026-10-03', startTime: '10:00:00', endTime: '11:00:00', status: 'Scheduled' }] }))
    : original(request))
  const cal = await mount()
  expect(within(cal).getByRole('button', { name: /Organization React Class/ })).toBeInTheDocument()
  expect(screen.queryByText(/Classes could not be displayed/)).not.toBeInTheDocument()
  classTitle = 'Updated organization class'
  fireEvent.click(screen.getByRole('button', { name: 'Refresh calendar' }))
  await within(cal).findByRole('button', { name: /Updated organization class/ }, { timeout: 3000 })
  expect(within(cal).queryByRole('button', { name: /Organization React Class/ })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('checkbox', { name: /^Classes/ }))
  expect(within(cal).queryByRole('button', { name: /Updated organization class/ })).not.toBeInTheDocument()
})
it('loads six endpoints once, uses upcoming, filters and preserves grid while refreshing', async () => {
  const cal = await mount()
  expect(apiClient.request).toHaveBeenCalledTimes(6)
  expect(within(upcomingList()).getByRole('button', { name: /Calendar test/ })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Agenda', exact: true }))
  expect(within(cal).getByRole('button', { name: /Calendar test/ })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('checkbox', { name: /^Meetings/ }))
  expect(within(cal).queryByRole('button', { name: /Calendar test/ })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('checkbox', { name: /^Meetings/ }))
  showMonth()
  fireEvent.click(screen.getByRole('button', { name: 'Refresh calendar' }))
  await waitFor(() => expect(apiClient.request).toHaveBeenCalledTimes(12))
  expect(document.querySelectorAll('.hcw-month__cell').length).toBeGreaterThan(27)
  expect(within(cal).getByRole('button', { name: /Calendar test/ })).toBeInTheDocument()
})
it('reads details, edits and deletes with a refresh after each mutation', async () => {
  await mount()
  fireEvent.click(within(upcomingList()).getByRole('button', { name: /Calendar test/ }))
  fireEvent.click(await screen.findByRole('button', { name: 'Edit', exact: true }))
  // Edit loads the event (GET /events/42) before opening the form.
  fireEvent.change(await screen.findByLabelText(/^Title/), { target: { value: 'Edited test' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  await screen.findAllByRole('button', { name: /Edited test/ }, { timeout: 3000 })
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'PUT', url: `${base}/events/42`, data: expect.objectContaining({ title: 'Edited test' }) }))
  fireEvent.click(within(upcomingList()).getByRole('button', { name: /Edited test/ }))
  fireEvent.click(await screen.findByRole('button', { name: 'Delete', exact: true }))
  expect(screen.getByText('Are you sure you want to delete this event?')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Confirm', exact: true }))
  await waitFor(() => expect(screen.queryByRole('button', { name: /Edited test/ })).not.toBeInTheDocument(), { timeout: 3000 })
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'DELETE', url: `${base}/events/42` }))
  for (const source of ['holidays', 'leaves', 'classes']) expect(apiClient.request.mock.calls.filter(([request]) => request.url === `${base}/${source}`)).toHaveLength(1)
  for (const suffix of ['stats', 'upcoming']) expect(apiClient.request.mock.calls.filter(([request]) => request.url === `${base}/events/${suffix}`)).toHaveLength(3)
})
it('creates through the documented DTO and reloads endpoint data', async () => {
  await mount()
  fireEvent.click(screen.getAllByRole('button', { name: 'Add Event', exact: true })[0])
  fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: 'Created test' } })
  fireEvent.change(screen.getByLabelText(/^Event Type/), { target: { value: 'MEETING' } })
  fireEvent.change(screen.getByLabelText(/^Start Date Time/), { target: { value: '2026-10-03T10:00' } })
  fireEvent.change(screen.getByLabelText(/^End Date Time/), { target: { value: '2026-10-03T11:00' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  await screen.findAllByRole('button', { name: /Created test/ }, { timeout: 3000 })
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST', url: `${base}/events`, data: expect.objectContaining({ title: 'Created test', eventType: 'MEETING' }) }))
  for (const source of ['holidays', 'leaves', 'classes']) expect(apiClient.request.mock.calls.filter(([request]) => request.url === `${base}/${source}`)).toHaveLength(1)
})
it('isolates secondary failures and reports mapping mismatches', async () => {
  const original = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(request => request.url.endsWith('/holidays') ? Promise.resolve(response({ items: [{ date: '2026-10-02' }] })) : request.url.endsWith('/stats') ? Promise.reject({ response: { status: 500, data: { message: 'Stats unavailable' } } }) : original(request))
  await mount()
  expect(screen.getByText('Stats unavailable')).toBeInTheDocument()
  expect(screen.getByText(/Holidays could not be displayed because the server response could not be read/)).toBeInTheDocument()
})
it('keeps events visible when deletion fails and shows the backend error', async () => {
  const original = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(request => request.method === 'DELETE' ? Promise.reject({ response: { status: 409, data: { message: 'This event cannot be deleted' } } }) : original(request))
  await mount()
  fireEvent.click(within(upcomingList()).getByRole('button', { name: /Calendar test/ }))
  fireEvent.click(await screen.findByRole('button', { name: 'Delete', exact: true }))
  fireEvent.click(screen.getByRole('button', { name: 'Confirm', exact: true }))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Confirm', exact: true })).not.toBeDisabled())
  expect(within(upcomingList()).getByRole('button', { name: /Calendar test/ })).toBeInTheDocument()
  expect(records).toHaveLength(1)
  expect(apiClient.request.mock.calls.filter(([r]) => r.url === `${base}/events` && r.method === 'GET')).toHaveLength(1)
})

it('follows pagination with the same date range and stops at totalPages', async () => {
  const api = { list: vi.fn().mockResolvedValueOnce({ items: [event], totalPages: 2 }).mockResolvedValueOnce({ items: [holiday], totalPages: 2 }) }
  const params = { FromDate: '2026-10-01T00:00:00Z', ToDate: '2026-10-31T23:59:59Z', PageSize: 1 }
  expect(await loadCalendarEvents(api, params)).toHaveLength(2)
  expect(api.list).toHaveBeenNthCalledWith(2, { ...params, PageNumber: 2 }, undefined)
})

it('uses one local selected-month range and never reports failed sources as zero', () => {
  const month = new Date(2026, 9, 1)
  const range = calendarMonthRange(month)
  expect(range.start).toEqual(new Date(2026, 9, 1))
  expect(range.end.getTime() + 1).toBe(range.next.getTime())
  const rows = normalizeCalendar([event, { ...event, eventId: 70, startDateTime: '2025-10-02T10:00:00', endDateTime: '2025-10-02T11:00:00' }])
  expect(calendarMonthMetrics(rows, month, ['leaves'])).toMatchObject({ total: null, meetings: 1, classes: 0, leaves: null })
  expect(calendarMonthMetrics([], month)).toMatchObject({ total: 0, meetings: 0, leaves: 0 })
})

it('keeps the stats API total and marks only the failed leaves source unavailable', async () => {
  const original = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(request => request.url.endsWith('/leaves') ? Promise.reject({ response: { status: 403 } }) : original(request))
  await mount()
  expect(screen.getByText('1 event this month')).toBeInTheDocument()
  expect(screen.getByRole('checkbox', { name: /^Leave Events/ }).closest('label')).toHaveTextContent('Unavailable')
  expect(screen.getByRole('checkbox', { name: /^Meetings/ }).closest('label')).toHaveTextContent(/Meetings\s*1/)
})

it('rejects a repeated final page instead of counting duplicate records', async () => {
  const api = { list: vi.fn().mockResolvedValue({ items: [event], totalPages: 2 }) }
  await expect(loadCalendarEvents(api, { PageSize: 1 })).rejects.toThrow(/repeated a page/)
})

it('filters past upcoming records, keeps ongoing all-day records and sorts chronologically', () => {
  const rows = normalizeCalendar([
    { ...event, eventId: 1, startDateTime: '2026-10-01T10:00:00', endDateTime: '2026-10-01T11:00:00' },
    { ...event, eventId: 2, startDateTime: '2026-10-04T10:00:00', endDateTime: '2026-10-04T11:00:00' },
    { ...event, eventId: 3, startDateTime: '2026-10-03T10:00:00', endDateTime: '2026-10-03T11:00:00' },
    { ...event, eventId: 4, startDateTime: '2026-10-02', endDateTime: '2026-10-02', allDay: true },
  ])
  expect(upcomingCalendarEvents(rows, new Date('2026-10-02T12:00:00').getTime()).map(row => row.id)).toEqual([4, 3, 2])
})

it('keeps the stats total while changing months without refetching range-independent stats/upcoming', async () => {
  await mount()
  // The toolbar's Next comes before the mini calendar's in the document.
  fireEvent.click(screen.getAllByRole('button', { name: 'Next month' })[0])
  await waitFor(() => expect(apiClient.request.mock.calls.filter(([request]) => request.url === `${base}/classes`)).toHaveLength(2))
  await waitFor(() => expect(document.querySelector('.hcw-bar__loading')).not.toBeInTheDocument())
  expect(screen.getByText('1 event this month')).toBeInTheDocument()
  for (const suffix of ['stats', 'upcoming']) expect(apiClient.request.mock.calls.filter(([request]) => request.url === `${base}/events/${suffix}`)).toHaveLength(1)
})

it('loads the whole visible month grid so weeks that cross months are complete', async () => {
  await mount()
  const list = apiClient.request.mock.calls.map(([request]) => request).find((request) => request.url === `${base}/events` && request.method === 'GET')
  const from = new Date(list.params.FromDate)
  const to = new Date(list.params.ToDate)
  expect(from.getDay()).toBe(0)
  expect(to.getDay()).toBe(6)
  expect(from.getDate() === 1 || from.getMonth() !== to.getMonth()).toBe(true)
})

it('maps the verified leave dates locally with both days included and no third day', () => {
  const [record] = normalizeCalendar([leave], 'leaves')
  expect(record).toMatchObject({ id: 8, employeeId: 9, employeeName: leave.employeeName, leaveType: 'Sick', status: 'PENDING', description: 'emergency', profilePhoto: null, allDay: true, source: 'leaves', type: 'leaves' })
  expect(record.start).toEqual(new Date(2026, 9, 1))
  expect(record.end).toEqual(new Date(2026, 9, 2))
  for (const day of [1, 2]) expect(calendarOnDay(record, new Date(2026, 9, day))).toBe(true)
  for (const day of [0, 3]) expect(calendarOnDay(record, new Date(2026, 9, day))).toBe(false)
  expect(() => normalizeCalendar([{ ...leave, startDate: undefined, fromDate: leave.startDate }], 'leaves')).toThrow(/startDate/)
  expect(() => normalizeCalendar([{ ...leave, endDate: '2026-09-30T00:00:00' }], 'leaves')).toThrow(/endDate/)
})

it('accepts only the verified items container and guards non-empty unknown DTOs', () => {
  for (const source of ['events', 'leaves', 'holidays', 'classes']) expect(normalizeResponse({ items: [] }, source)).toEqual([])
  for (const value of [[], { events: [] }, { nested: { items: [] } }]) expect(() => normalizeResponse(value)).toThrow(/response.items/)
  for (const source of ['holidays', 'classes']) expect(() => normalizeCalendar([event], source)).toThrow(/verified response DTO/)
  expect(calendarStats({ eventsThisMonth: 0, classesScheduled: 0, meetings: 0, holidays: 0, leaveEvents: 0 })).toMatchObject({ leaveEvents: 0 })
  expect(() => calendarStats({ totalEvents: 1 })).toThrow(/verified metric/)
})

it('renders the supplied successful empty responses and Oct 1–2 leave without overriding zero stats', async () => {
  records = []
  const original = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(request => request.url.endsWith('/leaves') ? Promise.resolve(response({ items: [leave] })) : original(request))
  render(<MemoryRouter><HrApiModule module="calendar" /></MemoryRouter>)
  await screen.findByText('Nothing coming up.')
  showMonth()
  const buttons = await within(document.querySelector('.hcw-main')).findAllByRole('button', { name: /nani narendraaaa.*Sick leave/ })
  expect(buttons).toHaveLength(2)
  expect(buttons.map(button => button.closest('.hcw-month__cell').querySelector('.hcw-month__day').textContent)).toEqual(['1', '2'])
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(screen.getByText('0 events this month')).toBeInTheDocument()
  fireEvent.click(buttons[0])
  expect(await screen.findByText('PENDING')).toBeInTheDocument()
  expect(screen.getByText(/Leave events come from Leave Management/)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Edit', exact: true })).not.toBeInTheDocument()
  expect(apiClient.request.mock.calls.some(([request]) => request.url === `${base}/events/8`)).toBe(false)
})

it('shows a successful empty calendar and agenda when all source items are empty', async () => {
  records = []
  render(<MemoryRouter><HrApiModule module="calendar" /></MemoryRouter>)
  await screen.findByText('Nothing coming up.')
  expect(screen.getByText(/^No events in /)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Agenda', exact: true }))
  expect(screen.getByText(/No events in this month for the selected calendars/)).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
