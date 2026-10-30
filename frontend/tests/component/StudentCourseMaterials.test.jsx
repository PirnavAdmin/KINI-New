import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import StudentCourseMaterials from '../../src/features/student/pages/StudentCourseMaterials';

const mocks = vi.hoisted(() => ({ file: vi.fn(), download: vi.fn() }));
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));
vi.mock('@/services/courseService', () => ({ courseService: { getStudentCourses: async () => [{ courseId: 4, courseName: 'React', pdfUrl: '/files/react.pdf' }] } }));
vi.mock('@shared/services/courseMaterialService', () => ({ courseMaterialService: { list: async () => [], file: mocks.file } }));
vi.mock('@shared/utils/download', () => ({ triggerFileDownload: mocks.download }));
beforeEach(() => { vi.resetAllMocks(); URL.createObjectURL = vi.fn(() => 'blob:preview'); URL.revokeObjectURL = vi.fn(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('opens the tab during the click and passes the full material to the file service', async () => {
  const preview = { opener: {}, location: { replace: vi.fn() }, close: vi.fn() };
  const open = vi.spyOn(window, 'open').mockReturnValue(preview);
  let resolve;
  mocks.file.mockReturnValue(new Promise((done) => { resolve = done; }));
  render(<StudentCourseMaterials />);
  fireEvent.click(await screen.findByRole('button', { name: 'Open PDF' }));
  expect(open).toHaveBeenCalledWith('about:blank', '_blank');
  expect(preview.opener).toBeNull();
  expect(mocks.file).toHaveBeenCalledWith(expect.objectContaining({ courseId: 4, resourceUrl: '/files/react.pdf' }));
  resolve(new Blob(['pdf']));
  await waitFor(() => expect(preview.location.replace).toHaveBeenCalledWith('blob:preview'));
});

it('downloads a real file without opening a tab', async () => {
  const blob = new Blob(['pdf']);
  mocks.file.mockResolvedValue(blob);
  const open = vi.spyOn(window, 'open');
  render(<StudentCourseMaterials />);
  fireEvent.click(await screen.findByRole('button', { name: 'Download PDF' }));
  await waitFor(() => expect(mocks.download).toHaveBeenCalledWith(blob, 'React course material.pdf'));
  expect(open).not.toHaveBeenCalled();
});

it('closes the reserved tab and reports failed file requests', async () => {
  const preview = { opener: null, close: vi.fn() };
  vi.spyOn(window, 'open').mockReturnValue(preview);
  mocks.file.mockRejectedValue({ response: { status: 404 } });
  render(<StudentCourseMaterials />);
  fireEvent.click(await screen.findByRole('button', { name: 'Open PDF' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('no longer available');
  expect(preview.close).toHaveBeenCalled();
});
