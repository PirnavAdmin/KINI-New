import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import AttendancePanel from '@features/organization/components/profile/AttendancePanel';
import EmployeeProfileWizard from '@shared/components/EmployeeProfileWizard';
import { formatEmployeeAddress } from '@shared/utils/employeePresentation';
import toast from 'react-hot-toast';

const { savePdf } = vi.hoisted(() => ({ savePdf: vi.fn() }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('jspdf', () => ({ jsPDF: class {
  setFont() {} setFontSize() {} setTextColor() {} text() {} addPage() {}
  splitTextToSize(text) { return [text]; }
  save(name) { savePdf(name); }
} }));
beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('displays saved mentor address components and structured addresses', () => {
  expect(formatEmployeeAddress({ houseNumber: '10', streetArea: 'Main Road', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500001' }))
    .toBe('10, Main Road, Hyderabad, Telangana, India, 500001');
  expect(formatEmployeeAddress({ address: { line1: '12 Main Road', city: 'Hyderabad' } })).toBe('12 Main Road, Hyderabad');
});

it('shows mentor attendance without selection checkboxes and announces its export', () => {
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:attendance') });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  render(<AttendancePanel rows={[{ id: 1, date: '2026-11-02', status: 'Present' }]} minutesOf={() => 60} />);
  expect(screen.queryByRole('checkbox')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Export' }));
  expect(toast.success).toHaveBeenCalledWith('Attendance export download started.');
});

it('announces a profile download after starting the PDF save', () => {
  render(<EmployeeProfileWizard initialData={{ firstName: 'Test', lastName: 'Mentor' }} />);
  fireEvent.click(screen.getByRole('button', { name: /6. Review/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
  expect(savePdf).toHaveBeenCalledWith('test-mentor-profile.pdf');
  expect(toast.success).toHaveBeenCalledWith('Profile PDF download started.');
});

it('reports a PDF failure without showing a success notification', () => {
  savePdf.mockImplementationOnce(() => { throw new Error('Download failed'); });
  render(<EmployeeProfileWizard initialData={{ firstName: 'Test' }} />);
  fireEvent.click(screen.getByRole('button', { name: /6. Review/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
  expect(toast.error).toHaveBeenCalled();
  expect(toast.success).not.toHaveBeenCalled();
});
