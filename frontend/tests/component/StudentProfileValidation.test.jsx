import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import StudentProfile from '@/features/student/pages/StudentProfile';
import { getUserProfile, updateUserProfile, buildProfilePayload } from '@/services/profileService';
import { profilePhotoService, notifyProfilePhotoChanged } from '@shared/services/profilePhotoService';
import toast from 'react-hot-toast';

const auth = vi.hoisted(() => ({ user: { studentId: 5 } }));
vi.mock('@shared/hooks/useAuth', () => ({ useAuth: () => auth }));
vi.mock('@features/student/hooks/useAssignedMentor', () => ({ useAssignedMentor: () => ({ mentor: null }) }));
vi.mock('@shared/hooks/useProfilePhoto', () => ({ useCurrentUserPhoto: () => '' }));
vi.mock('@/services/courseService', () => ({ courseService: { getStudentCourses: async () => [] } }));
vi.mock('@/services/assessmentService', () => ({ default: { getAvailableAssessments: async () => [] } }));
vi.mock('@shared/services/apiServices', () => ({ dashboardApi: { studentDashboard: async () => ({}) } }));
vi.mock('@/services/profileService', () => ({
  resolveUserId: () => 5, getUserProfile: vi.fn(), updateUserProfile: vi.fn(),
  buildProfilePayload: vi.fn(form => ({ firstName: form.fullName, phone: form.phoneNumber })),
  getProfileErrorMessage: error => error.message,
}));
vi.mock('@shared/services/profilePhotoService', () => ({
  profilePhotoService: { upload: vi.fn() }, canLoadImage: async () => true,
  notifyProfilePhotoChanged: vi.fn(),
}));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
const profile = { fullName: 'Sri Hari', phoneNumber: '9876543210', profileImage: '/old.jpg', raw: { fullName: 'Sri Hari', phone: '9876543210' } };
beforeEach(() => { vi.clearAllMocks(); getUserProfile.mockResolvedValue(profile); });
afterEach(cleanup);
const edit = async () => {
  const view = render(<StudentProfile />);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Edit Profile' }));
  return view;
};

it('rejects numeric names before building or sending a profile update', async () => {
  await edit();
  fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Sri123 Hari' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  expect(screen.getByText('Enter a valid full name using letters, without numbers.')).toBeInTheDocument();
  expect(buildProfilePayload).not.toHaveBeenCalled();
  expect(updateUserProfile).not.toHaveBeenCalled();
});
it.each(['1234567890', '98765'])('rejects invalid Indian mobile number %s', async phone => {
  await edit();
  fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: phone } });
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  expect(screen.getByText(/Enter a valid 10-digit Indian mobile number/)).toBeInTheDocument();
  expect(updateUserProfile).not.toHaveBeenCalled();
});
it('prevents extra digits and nonnumeric phone input', async () => {
  await edit();
  const phone = screen.getByLabelText('Phone Number');
  expect(phone).toHaveAttribute('maxlength', '10');
  fireEvent.change(phone, { target: { value: '98765432101' } });
  expect(phone).toHaveValue('9876543210');
  fireEvent.change(phone, { target: { value: 'abc' } });
  expect(phone).toHaveValue('9876543210');
});
it('uploads a photo through the photo API and refreshes the avatar and header', async () => {
  profilePhotoService.upload.mockResolvedValue({ photoUrl: '/new.jpg' });
  const { container } = await edit();
  const file = new File(['image'], 'photo.png', { type: 'image/png' });
  fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [file] } });
  await waitFor(() => expect(profilePhotoService.upload).toHaveBeenCalledWith(file));
  await waitFor(() => expect(screen.getByAltText('Sri Hari').getAttribute('src')).toContain('/new.jpg?_photo='));
  expect(notifyProfilePhotoChanged).toHaveBeenCalledWith({ photoUrl: expect.stringContaining('/new.jpg?_photo=') });
  expect(toast.success).toHaveBeenCalledWith('Profile photo uploaded successfully.');
});
it('retains the previous photo and reports an upload failure', async () => {
  profilePhotoService.upload.mockRejectedValue(new Error('network'));
  const { container } = await edit();
  fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [new File(['image'], 'photo.png', { type: 'image/png' })] } });
  await waitFor(() => expect(toast.error).toHaveBeenCalled());
  expect(screen.getByAltText('Sri Hari')).toHaveAttribute('src', '/old.jpg');
  expect(toast.success).not.toHaveBeenCalled();
});
