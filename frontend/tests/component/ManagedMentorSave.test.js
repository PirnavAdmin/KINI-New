import { beforeEach, expect, it, vi } from 'vitest';
import { saveManagedMentor } from '../../src/shared/services/managedMentorService';
import { employeeService } from '../../src/shared/services/employeeService';
import { mentorService } from '../../src/shared/services/mentorService';

vi.mock('../../src/shared/services/employeeService', () => ({ employeeService: { updateEmployee: vi.fn(), getEmployee: vi.fn() } }));
vi.mock('../../src/shared/services/mentorService', () => ({ mentorService: { updateMentor: vi.fn(), createMentor: vi.fn(), getMentor: vi.fn() } }));
beforeEach(() => vi.resetAllMocks());
const values = { name: 'Test Mentor', email: 'mentor@example.com', mobile: '9876543210', active: true, type: 'Part-time', designation: 'Senior Mentor', courseIds: [], changedFields: ['name', 'type'] };

it('saves an employee-backed mentor by employee ID, then reads authoritative data', async () => {
  employeeService.updateEmployee.mockResolvedValue({ success: true });
  employeeService.getEmployee.mockResolvedValue({ data: { employeeId: 42, firstName: 'Test', employeeType: 'Part-time' } });
  const result = await saveManagedMentor({ id: 99, mentorId: 99, employeeRecordId: 42, role: 'Mentor' }, values);
  expect(employeeService.updateEmployee).toHaveBeenCalledWith(42, expect.objectContaining({ firstName: 'Test', employeeType: 'Part-time', status: 'Active' }));
  expect(employeeService.updateEmployee.mock.calls[0][1]).not.toHaveProperty('courseIds');
  expect(mentorService.updateMentor).not.toHaveBeenCalled();
  expect(employeeService.getEmployee).toHaveBeenCalledWith(42);
  expect(result.employeeType).toBe('Part-time');
});

it('preserves the real mentor endpoint and courses for mentor catalogue records', async () => {
  mentorService.updateMentor.mockResolvedValue({ success: true });
  mentorService.getMentor.mockResolvedValue({ mentorId: 99, courseIds: [8] });
  await saveManagedMentor({ mentorId: 99 }, { ...values, courseIds: [8], changedFields: ['name', 'courseIds'] });
  expect(mentorService.updateMentor).toHaveBeenCalledWith(99, expect.objectContaining({ courseIds: [8], status: true }));
  expect(employeeService.updateEmployee).not.toHaveBeenCalled();
});

it('does not report unsupported profile fields as saved', async () => {
  await expect(saveManagedMentor({ employeeRecordId: 42 }, { ...values, changedFields: ['skills'] })).rejects.toThrow('skills');
  expect(employeeService.updateEmployee).not.toHaveBeenCalled();
});

it('propagates save errors without refreshing as though the save succeeded', async () => {
  employeeService.updateEmployee.mockRejectedValue(new Error('Forbidden'));
  await expect(saveManagedMentor({ employeeRecordId: 42 }, values)).rejects.toThrow('Forbidden');
  expect(employeeService.getEmployee).not.toHaveBeenCalled();
});
