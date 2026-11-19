import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import CoursePoster, { CoursePosterThumbnail } from '@/pages/courses/CoursePoster.jsx';
import { COURSE_POSTER_LIMIT, coursePosterUrl, validateCoursePoster } from '@/pages/courses/coursePosterUtils';

afterEach(cleanup);
it.each(['image/jpeg', 'image/png', 'image/webp'])('accepts %s with a matching extension', type => {
  const extension = type.split('/')[1];
  expect(validateCoursePoster(new File(['image'], `poster.${extension}`, { type }))).toBe('');
});
it('rejects unsupported, empty, and oversized images', () => {
  expect(validateCoursePoster(new File(['pdf'], 'file.pdf', { type: 'application/pdf' }))).toContain('JPG');
  expect(validateCoursePoster(new File([], 'file.png', { type: 'image/png' }))).toContain('empty');
  expect(validateCoursePoster({ name: 'file.png', type: 'image/png', size: COURSE_POSTER_LIMIT + 1 })).toContain('5 MB');
});
it('falls back when a saved poster is missing or broken', () => {
  const { rerender } = render(<CoursePosterThumbnail url="" />);
  expect(screen.getByText('No poster')).toBeInTheDocument();
  rerender(<CoursePosterThumbnail url="https://example.test/poster.png" />);
  fireEvent.error(screen.getByRole('img'));
  expect(screen.getByText('No poster')).toBeInTheDocument();
  expect(coursePosterUrl('javascript:alert(1)')).toBe('');
});
it('shows the saved poster and makes removal explicit', () => {
  const onChange = vi.fn();
  render(<CoursePoster savedUrl="https://example.test/poster.png" file={null} removed={false} onChange={onChange} />);
  expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.test/poster.png');
  fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
  expect(onChange).toHaveBeenCalledWith(null, true);
});
it('reports an invalid selection inline without changing the poster', () => {
  const onChange = vi.fn();
  render(<CoursePoster savedUrl="" file={null} removed={false} onChange={onChange} />);
  fireEvent.change(screen.getByLabelText(/Course Poster/), { target: { files: [new File(['pdf'], 'file.pdf', { type: 'application/pdf' })] } });
  expect(screen.getByRole('alert')).toHaveTextContent('JPG, PNG, or WebP');
  expect(onChange).not.toHaveBeenCalled();
});
