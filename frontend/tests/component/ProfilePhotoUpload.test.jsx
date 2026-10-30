import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import toast from 'react-hot-toast'
import ProfilePage from '../../src/pages/profile/ProfilePage'
import { canLoadImage, profilePhotoService } from '../../src/shared/services/profilePhotoService'

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }))
const authState = vi.hoisted(() => ({ user: { firstName: 'Nara', lastName: 'Nandan', role: 'Mentor' } }))
vi.mock('../../src/shared/hooks/useAuth', () => ({ useAuth: () => authState }))
vi.mock('../../src/shared/components/EmployeeProfileWizard', () => ({ default: () => null }))
vi.mock('../../src/features/mentor/components/MentorPageHeader', () => ({ default: ({ title }) => <h1>{title}</h1> }))
vi.mock('../../src/shared/services/employeeProfileService', () => ({
  employeeProfileService: {
    getProfile: vi.fn(async () => ({ firstName: 'Nara', lastName: 'Nandan' })),
    getDepartments: vi.fn(async () => []),
    getDocumentTypes: vi.fn(async () => []),
  },
}))
vi.mock('../../src/shared/services/profilePhotoService', async (importOriginal) => ({
  ...(await importOriginal()),
  canLoadImage: vi.fn(),
  profilePhotoService: { get: vi.fn(), upload: vi.fn(), remove: vi.fn() },
}))

const OLD = 'https://cdn.test/old.jpg'
const NEW = 'https://cdn.test/new.jpg'
const file = () => new File(['png'], 'me.png', { type: 'image/png' })

beforeEach(() => {
  vi.clearAllMocks()
  URL.createObjectURL = vi.fn(() => 'blob:preview')
  URL.revokeObjectURL = vi.fn()
  profilePhotoService.get.mockResolvedValue({ photoUrl: OLD })
  canLoadImage.mockImplementation(async (src) => src === NEW)
})
afterEach(cleanup)

const renderWithPhoto = async () => {
  const view = render(<ProfilePage />)
  fireEvent.click(await screen.findByRole('button', { name: 'Personal Info' }))
  await waitFor(() => expect(screen.getByAltText('Profile')).toHaveAttribute('src', OLD))
  return { ...view, input: view.container.querySelector('input[type="file"]') }
}

it('keeps the current photo when the file picker is cancelled', async () => {
  const { input } = await renderWithPhoto()
  fireEvent.change(input, { target: { files: [] } })
  expect(profilePhotoService.upload).not.toHaveBeenCalled()
  expect(screen.getByAltText('Profile')).toHaveAttribute('src', OLD)
})

it('restores the previous photo when the upload fails', async () => {
  let rejectUpload
  profilePhotoService.upload.mockReturnValue(new Promise((_, reject) => { rejectUpload = reject }))
  const { input } = await renderWithPhoto()

  fireEvent.change(input, { target: { files: [file()] } })
  expect(await screen.findByText('Uploading...')).toBeInTheDocument()
  expect(screen.getByAltText('Profile')).toHaveAttribute('src', 'blob:preview')

  rejectUpload(new Error('network'))
  await waitFor(() => expect(screen.getByAltText('Profile')).toHaveAttribute('src', OLD))
  expect(toast.error).toHaveBeenCalledWith('Unable to upload profile photo. Please try again.')
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview')
  expect(profilePhotoService.remove).not.toHaveBeenCalled()
  expect(input.value).toBe('')
})

it('swaps in the new server photo only after upload succeeds and tells the header', async () => {
  profilePhotoService.upload.mockResolvedValue({ photoUrl: NEW })
  const listener = vi.fn()
  window.addEventListener('kini:profile-photo-changed', listener)
  const { input } = await renderWithPhoto()

  fireEvent.change(input, { target: { files: [file()] } })
  await waitFor(() => expect(screen.getByAltText('Profile')).toHaveAttribute('src', NEW))
  expect(listener.mock.calls[0][0].detail).toEqual({ photoUrl: NEW, removed: false })
  window.removeEventListener('kini:profile-photo-changed', listener)
})

it('never shows a blank avatar when the upload succeeds but returns an unloadable URL', async () => {
  profilePhotoService.upload.mockResolvedValue({ photoUrl: 'Photo uploaded successfully' })
  const { input } = await renderWithPhoto()
  profilePhotoService.get.mockResolvedValue({ photoUrl: '' })

  fireEvent.change(input, { target: { files: [file()] } })
  await waitFor(() => expect(toast.success).toHaveBeenCalled())
  expect(screen.getByAltText('Profile')).toHaveAttribute('src', 'blob:preview')
})

it('falls back to initials when the photo URL fails to load', async () => {
  await renderWithPhoto()
  fireEvent.error(screen.getByAltText('Profile'))
  expect(screen.queryByAltText('Profile')).not.toBeInTheDocument()
  expect(screen.getByText('NN')).toBeInTheDocument()
})

it('removes the photo only after the remove API succeeds', async () => {
  profilePhotoService.remove.mockRejectedValueOnce(new Error('nope'))
  await renderWithPhoto()
  fireEvent.click(screen.getByRole('button', { name: 'Remove photo' }))
  await waitFor(() => expect(toast.error).toHaveBeenCalled())
  expect(screen.getByAltText('Profile')).toHaveAttribute('src', OLD)
})
