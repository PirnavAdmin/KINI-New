// The course API's `duration` field is a course-length value. The course
// management contract uses months for numeric values (for example, `4`
// represents `4 Months`), while string values may already include their unit.
export const formatCourseDuration = (value, unit) => {
  if (value === undefined || value === null || String(value).trim() === '') return '';

  const raw = String(value).trim();
  if (/\b(years?|months?|weeks?|days?|hours?)\b/i.test(raw)) return raw;

  const explicitUnit = String(unit ?? '').trim();
  if (explicitUnit) return `${raw} ${explicitUnit}`;

  return /^\d+(\.\d+)?$/.test(raw) ? `${raw} Months` : raw;
};
