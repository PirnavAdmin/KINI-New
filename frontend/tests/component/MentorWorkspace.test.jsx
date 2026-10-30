import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MentorDirectoryPanel from '../../src/pages/trainers/MentorDirectoryPanel'
import MentorDetailPanel from '../../src/pages/trainers/MentorDetailPanel'
import { EMPTY_FILTERS, filterMentors } from '../../src/pages/trainers/mentorDirectory'

vi.mock('../../src/shared/services/batchService', () => ({ batchService: { getStudents: vi.fn(async () => ({ students: [] })) } }))
afterEach(cleanup)

// Test-only mentor records (shape of useTrainers' normalized rows).
const mentor = (overrides) => ({
  id: 9, name: 'nani narendraaaa', email: 'n@x.test', mobile: '9000000000', employeeId: 9, employmentType: 'Full-time',
  status: 'Active', students: 13, experience: 0, designation: 'Mentor', courses: [], assignedBatches: [], ...overrides,
})
const MENTORS = [
  mentor({ id: 1, name: 'Lakshmilahari Gandikota', employeeId: 1, email: 'lg@x.test' }),
  mentor({ id: 2, name: 'Kiran Babu', employeeId: 4, status: 'On Leave', employmentType: 'Contract' }),
  mentor({ id: 3, name: 'Divya Sri', employeeId: 5, status: 'Inactive' }),
]

const renderDirectory = (props = {}) => {
  const onSelect = vi.fn()
  const onFiltersChange = vi.fn()
  render(
    <MentorDirectoryPanel
      mentors={MENTORS} total={3} counts={{ all: 3, Active: 1, 'On Leave': 1, Inactive: 1 }}
      filters={EMPTY_FILTERS} options={{ courses: [], batches: [], types: [] }}
      onFiltersChange={onFiltersChange} onClearFilters={vi.fn()} hasFilters={false}
      selectedId={1} onSelect={onSelect} onExport={vi.fn()} photoFor={() => ''}
      loading={false} error="" onRetry={vi.fn()} {...props}
    />,
  )
  return { onSelect, onFiltersChange }
}

it('lists mentors as options with the selection marked and real status counts', () => {
  const { onFiltersChange } = renderDirectory()
  const options = screen.getAllByRole('option')
  expect(options).toHaveLength(3)
  expect(options[0]).toHaveAttribute('aria-selected', 'true')
  expect(options[0]).toHaveTextContent('Lakshmilahari GandikotaEmp ID 1')
  expect(screen.getByRole('button', { name: /^On Leave\s*1$/ })).toHaveAttribute('aria-pressed', 'false')
  fireEvent.click(screen.getByRole('button', { name: /^Inactive\s*1$/ }))
  expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'Inactive' }))
})

it('selects with a click and moves the selection with the arrow keys', () => {
  const { onSelect } = renderDirectory()
  fireEvent.click(screen.getByRole('option', { name: /Kiran Babu/ }))
  expect(onSelect).toHaveBeenLastCalledWith(2)
  fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' })
  expect(onSelect).toHaveBeenLastCalledWith(2)
  fireEvent.keyDown(screen.getByRole('listbox'), { key: 'End' })
  expect(onSelect).toHaveBeenLastCalledWith(3)
})

it('shows empty and error states instead of fake mentors', () => {
  renderDirectory({ mentors: [], total: 0 })
  expect(screen.getByText(/No mentors yet/)).toBeInTheDocument()
  cleanup()
  const onRetry = vi.fn()
  renderDirectory({ mentors: [], total: 0, error: 'Network down', onRetry })
  expect(screen.getByRole('alert')).toHaveTextContent('Network down')
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(onRetry).toHaveBeenCalled()
})

it('filters by name, email or ID and by status', () => {
  expect(filterMentors(MENTORS, { ...EMPTY_FILTERS, query: 'lg@x' }).map((item) => item.id)).toEqual([1])
  expect(filterMentors(MENTORS, { ...EMPTY_FILTERS, query: '5' }).map((item) => item.id)).toEqual([3])
  expect(filterMentors(MENTORS, { ...EMPTY_FILTERS, status: 'On Leave' }).map((item) => item.id)).toEqual([2])
})

const renderDetail = (trainer, handlers = {}) => render(
  <MemoryRouter>
    <MentorDetailPanel trainer={trainer} photo="" onViewProfile={vi.fn()} onEdit={vi.fn()} onAction={vi.fn()} onDeactivate={vi.fn()} {...handlers} />
  </MemoryRouter>,
)

it('shows real course and batch names, with the rest behind "+N"', () => {
  renderDetail(mentor({
    courses: ['React JS', { courseName: 'Java Full Stack' }, 'Python', 'React JS', '', null],
    assignedBatches: [{ batchId: 4, batchName: 'Java Full Stack 1' }, { batchId: 5, batchName: 'React Batch 2' }],
  }))
  const courses = screen.getByText('Teaching Courses').closest('section')
  expect(within(courses).getAllByRole('listitem').map((item) => item.textContent)).toEqual(['React JS', 'Java Full Stack', '+1'])
  const batches = screen.getByText('Assigned Batches').closest('section')
  expect(batches).toHaveTextContent('Java Full Stack 1React Batch 2')
  expect(screen.getByRole('tabpanel')).not.toHaveTextContent(/undefined|null|\[object Object\]/)
  fireEvent.click(within(courses).getByRole('button', { name: 'Show all 3' }))
  expect(screen.getByRole('tab', { name: 'Courses & Batches' })).toHaveAttribute('aria-selected', 'true')
})

it('says "Not provided" or shows the failure instead of inventing values', () => {
  renderDetail(mentor({ email: '', mobile: '', batchesError: 'Unable to load assigned batches. Please retry.' }))
  const contact = screen.getByText('Contact Information').closest('section')
  expect(within(contact).getAllByText('Not provided').length).toBeGreaterThanOrEqual(4)
  expect(screen.getByText('Batches unavailable')).toBeInTheDocument()
  expect(screen.getByText('About Mentor').closest('section')).toHaveTextContent('Not provided')
})

it('wires the header actions and keyboard tabs to the existing handlers', () => {
  const onViewProfile = vi.fn()
  const onEdit = vi.fn()
  const onAction = vi.fn()
  const trainer = mentor()
  renderDetail(trainer, { onViewProfile, onEdit, onAction })
  fireEvent.click(screen.getByRole('button', { name: 'View Profile' }))
  expect(onViewProfile).toHaveBeenCalledWith(trainer)
  // Course assignment lives in the ⋮ menu and the Courses & Batches tab, not the header.
  expect(screen.queryByRole('button', { name: 'Assign Courses' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'More actions for nani narendraaaa' }))
  fireEvent.click(screen.getByRole('menuitem', { name: 'Assign Batch' }))
  expect(onAction).toHaveBeenCalledWith('Assign Batch', trainer)
  fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0])
  expect(onEdit).toHaveBeenCalledWith(trainer)
  fireEvent.keyDown(screen.getByRole('tablist'), { key: 'End' })
  expect(screen.getByRole('tab', { name: 'Activity' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tabpanel')).toHaveTextContent('No dated activity')
})
