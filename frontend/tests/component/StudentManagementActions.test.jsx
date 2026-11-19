import { fireEvent, render, screen, within, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import StudentList from '../../src/pages/students/StudentList';
import { studentsApi } from '@/api/students';
vi.mock('@/api/students', () => ({ studentsApi: { updateStatus: vi.fn().mockResolvedValue({ data: { status: 'Inactive' } }), getAttendance: vi.fn().mockResolvedValue({ data: [] }) } }));
vi.mock('@shared/services/batchService', () => ({batchService:{getOrganizationBatches:vi.fn().mockResolvedValue({data:[]})}}));
afterEach(cleanup);
const students = [{id:1,studentId:1,name:'First Student',course:'React',batch:'A',status:'Inactive'},{id:2,studentId:2,name:'Second Student',course:'Java',batch:'B',status:'Active'}];
function Probe(){const l=useLocation();return <p data-testid="location">{l.pathname}{l.search}</p>}
function setup(){render(<MemoryRouter><StudentList students={students} onView={vi.fn()} onEdit={vi.fn()} notify={vi.fn()} /><Probe /></MemoryRouter>);}
it('persists a bulk status change before updating the rows', async () => {
  const onStudentsChange = vi.fn();
  render(<MemoryRouter><StudentList students={students} onStudentsChange={onStudentsChange} notify={vi.fn()} /></MemoryRouter>);
  fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select Second Student' })[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Change status' }));
  const select = screen.getByRole('option', { name: 'Select a status' }).closest('select');
  fireEvent.change(select, { target: { value: 'Inactive' } });
  fireEvent.click(screen.getByRole('button', { name: 'Apply to 1 students' }));
  await waitFor(() => expect(studentsApi.updateStatus).toHaveBeenCalledWith(2, 'Inactive'));
  await waitFor(() => expect(onStudentsChange).toHaveBeenCalledWith({ 2: { status: 'Inactive' } }));
});
it('uses descriptive All labels and preserves filtering',()=>{setup();expect(screen.getByRole('option',{name:'All Courses'})).toHaveValue('All');expect(screen.getByRole('option',{name:'All Status'})).toHaveValue('All');fireEvent.change(screen.getByRole('combobox',{name:/course/i}),{target:{value:'Java'}});expect(within(screen.getByRole('table')).queryByText('First Student')).not.toBeInTheDocument();});
it('only opens one action menu and closes it on outside click and Escape',()=>{setup();fireEvent.click(screen.getByRole('button',{name:'Actions for First Student'}));expect(screen.getAllByRole('menu')).toHaveLength(1);fireEvent.click(screen.getByRole('button',{name:'Actions for Second Student'}));expect(screen.getAllByRole('menu')).toHaveLength(1);expect(screen.getByRole('button',{name:'Actions for First Student'})).toHaveAttribute('aria-expanded','false');fireEvent.keyDown(document,{key:'Escape'});expect(screen.queryByRole('menu')).not.toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Actions for First Student'}));fireEvent.pointerDown(document.body);expect(screen.queryByRole('menu')).not.toBeInTheDocument();});
it.each(['Attendance','Progress'])('opens the selected student %s tab',label=>{setup();fireEvent.click(screen.getByRole('button',{name:'Actions for Second Student'}));fireEvent.click(screen.getByRole('menuitem',{name:'View '+label.toLowerCase()}));expect(screen.getByTestId('location')).toHaveTextContent('/organization/students/2?tab='+label);expect(screen.queryByRole('menu')).not.toBeInTheDocument();});

it('reports the filtered rows to the summary and export, matching pagination', async () => {
  const onRowsChange = vi.fn();
  render(<MemoryRouter><StudentList students={students} onRowsChange={onRowsChange} /></MemoryRouter>);
  await waitFor(() => expect(onRowsChange.mock.lastCall[0]).toHaveLength(2));
  fireEvent.change(screen.getByRole('combobox', { name: /course/i }), { target: { value: 'Java' } });
  await waitFor(() => expect(onRowsChange.mock.lastCall[0].map(row => row.id)).toEqual([2]));
  expect(screen.getByText('Showing 1 to 1 of 1 students')).toBeInTheDocument();
});
