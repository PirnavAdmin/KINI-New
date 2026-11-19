import { resolvePhotoUrl } from '@shared/services/profilePhotoService';

export const COURSE_POSTER_LIMIT = 5 * 1024 * 1024;
export function validateCoursePoster(file) {
  if (!file) return '';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || !/\.(jpe?g|png|webp)$/i.test(file.name)) return 'Select a JPG, PNG, or WebP image.';
  if (!file.size) return 'The selected image is empty.';
  if (file.size > COURSE_POSTER_LIMIT) return 'Course poster must be 5 MB or smaller.';
  return '';
}
export function coursePosterUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  // Saved posters are public files under /uploads/course-posters (backend wwwroot).
  // Same resolution as profile photos: the Vite /uploads proxy in dev (it adds the
  // ngrok header), the backend origin in production.
  if (/^\/?uploads\//i.test(value.trim())) return resolvePhotoUrl(value.trim());
  try {
    const base = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    const url = new URL(value.trim().replace(/\\/g, '/'), `${base.replace(/\/$/, '')}/`);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}
