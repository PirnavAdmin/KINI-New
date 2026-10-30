import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AssessmentsPage from '@/pages/assessments/AssessmentsPage';

const mock = vi.hoisted(() => ({ state: {} }));
vi.mock('@/hooks/useAssessments', () => ({ useAssessments: () => mock.state }));
vi.mock('@/pages/assessments/CreateAssessment', () => ({ default: () => null }));
vi.mock('@/pages/assessments/AssessmentResults', () => ({ default: () => null }));
beforeEach(() => {
  mock.state = { assessments: [], batches: [], courses: [], audit: [], stats: {}, loading: false, error: '', refresh: vi.fn() };
});
afterEach(cleanup);
const mount = () => render(<MemoryRouter><AssessmentsPage /></MemoryRouter>);

it('shows an empty row spanning every header after an empty response', () => {
  mount();
  const cell = screen.getByText('No assessments found.').closest('td');
  expect(Number(cell.colSpan)).toBe(screen.getAllByRole('columnheader').length);
});
it('shows loading before empty or error states', () => {
  mock.state.loading = true;
  mock.state.error = 'Previous failure';
  mount();
  expect(screen.queryByText('No assessments found.')).not.toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(document.querySelector('tbody .kx-skel')).toBeInTheDocument();
});
it('shows a retryable error inside the table instead of a blank body', () => {
  mock.state.error = 'Request failed';
  mount();
  expect(screen.getByText('Unable to load assessments').closest('td')).toHaveAttribute('colspan', '11');
  expect(screen.queryByText('No assessments found.')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(mock.state.refresh).toHaveBeenCalledOnce();
});
it('filters API Test values case-insensitively, combines search and resets filters', () => {
  mock.state.assessments = [
    { id: 1, name: 'Java basics', type: 'TEST', status: 'Draft' },
    { id: 2, name: 'Java advanced', type: ' test ', status: 'Draft' },
    { id: 3, name: 'Coding exercise', type: 'Coding', status: 'Draft' },
  ];
  mount();
  const filter = screen.getByRole('combobox', { name: 'Filter by type' });
  expect(within(filter).getAllByRole('option', { name: 'Test' })).toHaveLength(1);
  fireEvent.change(filter, { target: { value: 'test' } });
  expect(screen.queryByText('Coding exercise')).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'advanced' } });
  expect(screen.getByText('Java advanced')).toBeInTheDocument();
  expect(screen.queryByText('Java basics')).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'missing' } });
  expect(screen.getByText('No assessments match these filters')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(screen.getByText('Coding exercise')).toBeInTheDocument();
  expect(screen.getByText('Java basics')).toBeInTheDocument();
});
