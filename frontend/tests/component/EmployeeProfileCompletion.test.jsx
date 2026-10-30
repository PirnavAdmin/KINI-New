import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import EmployeeProfileWizard from '../../src/shared/components/EmployeeProfileWizard';

afterEach(cleanup);
const profile = {
  firstName: 'Test', lastName: 'Employee', gender: 'Male', maritalStatus: 'Single', dateOfBirth: '1995-01-01',
  phone: '9876543210', email: 'test@example.com', aadhaarNumber: '123456789012', panNumber: 'ABCDE1234F',
  department: 'Finance', designation: 'Accountant', joiningDate: '2025-01-01', bloodGroup: 'O+',
  houseNumber: '10', streetArea: 'Main Road', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500001',
  bankName: 'Test Bank', accountHolderName: 'Test Employee', accountNumber: '12345678901', ifscCode: 'ABCD0123456', branchName: 'Main Branch',
};
async function reachReview(onSave, onComplete) {
  render(<EmployeeProfileWizard initialData={profile} onSave={onSave} onComplete={onComplete} />);
  for (let index = 0; index < 5; index++) {
    fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(index + 1));
    await screen.findByText(`Test Employee · Step ${index + 2} of 6`);
  }
}
it('leaves Review only after the final save succeeds', async () => {
  const onSave = vi.fn().mockResolvedValue({});
  const onComplete = vi.fn();
  await reachReview(onSave, onComplete);
  let resolveSave;
  onSave.mockImplementationOnce(() => new Promise((resolve) => { resolveSave = resolve; }));
  fireEvent.click(screen.getByRole('button', { name: 'Save profile' }));
  expect(onComplete).not.toHaveBeenCalled();
  resolveSave({});
  await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
});
it('keeps Review and entered details after a failed save', async () => {
  const onSave = vi.fn().mockResolvedValue({});
  const onComplete = vi.fn();
  await reachReview(onSave, onComplete);
  onSave.mockRejectedValueOnce(new Error('Save rejected'));
  fireEvent.click(screen.getByRole('button', { name: 'Save profile' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Save rejected');
  expect(screen.getByText('Test Employee · Step 6 of 6')).toBeInTheDocument();
  expect(onComplete).not.toHaveBeenCalled();
});
