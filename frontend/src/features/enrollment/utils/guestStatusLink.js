// Fragment credentials are not sent to the web server or included in Referer.
// Possession grants access: do not log or expose them to third-party services.
export function readGuestStatusRecords() {
  try {
    const records = JSON.parse(new URLSearchParams(window.location.hash.slice(1)).get('enrollmentStatus') || 'null');
    if (!Array.isArray(records) || !records.length || records.length > 50) return null;
    if (!records.every((r) => r && typeof r.guestAccessToken === 'string' && r.guestAccessToken.length >= 32
      && r.enrollmentId != null && r.courseId != null)) return null;
    return records;
  } catch { return null; }
}

export function guestStatusLink(records) {
  if (!records.length || records.some((r) => !r.guestAccessToken || !r.enrollmentId)) return '';
  const credentials = records.map(({ enrollmentId, courseId, courseName, price, guestAccessToken }) => ({ enrollmentId, courseId, courseName, price, guestAccessToken }));
  const url = new URL('/enrollment', window.location.origin);
  url.hash = new URLSearchParams({ enrollmentStatus: JSON.stringify(credentials) }).toString();
  return url.toString();
}
