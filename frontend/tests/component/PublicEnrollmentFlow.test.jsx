import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import EnrollmentPage from '@features/enrollment/pages/EnrollmentPage';
import { readEnrollmentDraft, writeEnrollmentDraft } from '@features/enrollment/utils/enrollmentDraft';

const state = vi.hoisted(() => ({ user: null, start: vi.fn(), resume: false, records: [], status: {} }));
vi.mock('@shared/hooks/useAuth', () => ({ useAuth: () => ({ user: state.user }) }));
vi.mock('@shared/context/ThemeContext', () => ({ useThemeContext: () => ({ isDark: false }) }));
vi.mock('@/context/CartContext', () => ({ useCart: () => ({ cartItems: [], removeFromCart: vi.fn() }) }));
vi.mock('@shared/services/batchService', () => ({ batchService: { getAll: vi.fn().mockResolvedValue([]) } }));
vi.mock('@/services/courseService', () => ({ courseService: { getStudentCourses: vi.fn().mockResolvedValue([]) } }));
vi.mock('@shared/services/upiPaymentService', () => ({ isUpiPaymentMode: true }));
vi.mock('@shared/services/demoPaymentApi', () => ({ isDemoPaymentMode: false, demoPaymentApi: {}, DEMO_LABEL: 'Demo' }));
vi.mock('@features/enrollment/components/EnrollmentNavbar', () => ({ default: () => <header>Login Register</header>, KiniWordmark: () => <span>KINI</span> }));
vi.mock('@features/enrollment/components/upi/UpiPaymentStep', () => ({ default: ({ onBack }) => <div>UPI payment<button onClick={onBack}>Back to Details</button></div> }));
vi.mock('@features/enrollment/hooks/useUpiCheckout', () => ({
  readUpiDraft: () => state.resume ? { phase: 'status', records: state.records } : null,
  default: () => ({ records: state.records, phase: 'idle', creating: false, createError: '', start: state.start, status: state.status }),
}));
vi.mock('framer-motion', async () => {
  const React = await import('react');
  return { AnimatePresence: ({ children }) => children, useReducedMotion: () => true,
    motion: new Proxy({}, { get: (_, tag) => React.forwardRef(({ children, initial, animate, exit, transition, whileHover, whileTap, ...props }, ref) => React.createElement(tag, { ...props, ref }, children)) }) };
});

beforeEach(() => {
  localStorage.clear();
  state.user = null;
  state.start.mockClear();
  state.resume = false;
  state.records = [{ courseId: 5, price: 5000 }];
  state.status = { stage: 'submitted' };
  writeEnrollmentDraft({ courses: [{ id: 5, name: 'React course', price: 5000 }] });
});
afterEach(cleanup);
function mount(entry = '/enrollment?courseId=5') {
  render(<MemoryRouter initialEntries={[entry]}><Routes>
    <Route path='/enrollment' element={<EnrollmentPage />} />
    <Route path='*' element={<div>Login destination</div>} />
  </Routes></MemoryRouter>);
}
async function fillDetails() {
  await screen.findByText('Batch assigned on approval');
  for (const [id, value] of Object.entries({ firstName: 'Asha', lastName: 'Rao', email: 'asha@example.com', phone: '9876543210', pincode: '560001' })) {
    fireEvent.change(document.getElementById(id), { target: { value } });
  }
  for (const id of ['state', 'qualification', 'experience']) {
    const select = document.getElementById(id);
    fireEvent.change(select, { target: { value: select.options[1].value } });
  }
}
it('allows guests into UPI payment without sign-in and preserves details going back', async () => {
  mount();
  await fillDetails();
  expect(screen.getByRole('button', { name: 'Continue to Payment', exact: true })).toBeDisabled();
  fireEvent.click(screen.getByRole('checkbox'));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Continue to Payment', exact: true })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Continue to Payment', exact: true }));
  await screen.findByText('UPI payment');
  expect(screen.queryByText('Login destination')).not.toBeInTheDocument();
  expect(state.start).toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Sign in to start payment' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Back to Details' }));
  await waitFor(() => expect(document.getElementById('email')).toHaveValue('asha@example.com'));
  expect(screen.getByRole('checkbox')).toBeChecked();
  fireEvent.click(screen.getByRole('button', { name: 'Continue to Payment', exact: true }));
  await screen.findByText('UPI payment');
  expect(readEnrollmentDraft()).toMatchObject({ step: 'payment', student: { email: 'asha@example.com', agreeTerms: true }, courses: [{ id: 5 }] });
});
it('blocks incomplete details even with terms checked', async () => {
  mount();
  await screen.findByText('Batch assigned on approval');
  fireEvent.click(screen.getByRole('checkbox'));
  expect(screen.getByRole('button', { name: 'Continue to Payment', exact: true })).toBeDisabled();
});
it('lets signed-in students continue to the existing UPI step', async () => {
  state.user = { id: 7, role: 'student' };
  mount();
  await fillDetails();
  fireEvent.click(screen.getByRole('checkbox'));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Continue to Payment', exact: true })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Continue to Payment', exact: true }));
  await screen.findByText('UPI payment');
  expect(state.start).toHaveBeenCalled();
});
it('resumes the payment step after student sign-in using the saved course and details', async () => {
  state.user = { id: 7, role: 'student' };
  writeEnrollmentDraft({ ...readEnrollmentDraft(), step: 'payment', student: { firstName: 'Asha', email: 'asha@example.com', agreeTerms: true } });
  mount({ pathname: '/enrollment', search: '?courseId=5', state: { resumeEnrollment: true } });
  await screen.findByText('UPI payment');
  expect(state.start).toHaveBeenCalled();
  expect(readEnrollmentDraft().student.email).toBe('asha@example.com');
});

it('keeps approved guests on the public page while password setup is pending', async () => {
  state.resume = true;
  state.records = [{ courseId: 5, price: 5000, enrollmentId: 42, guestAccessToken: 'a'.repeat(64) }];
  state.status = { stage: 'approved', accountReady: false, requiresPasswordSetup: true };
  mount();
  expect(screen.getAllByText('Enrollment approved. Check your email to set your password.').length).toBeGreaterThan(0);
  expect(screen.getByRole('button', { name: 'Go to Student Login' })).toBeInTheDocument();
  expect(screen.queryByText('Login destination')).not.toBeInTheDocument();
});

it('redirects approved guests to student login only when the server confirms account readiness', async () => {
  state.resume = true;
  state.records = [{ courseId: 5, price: 5000, enrollmentId: 42, guestAccessToken: 'a'.repeat(64) }];
  state.status = { stage: 'approved', accountReady: true };
  mount();
  expect(screen.getAllByText('Payment complete. Your enrollment is approved.').length).toBeGreaterThan(0);
  await screen.findByText('Login destination', {}, { timeout: 6000 });
});

