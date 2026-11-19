// Calendar dates use UTC components so timezone and DST changes cannot shift a day.
export function leaveWorkingDays(start, end) {
  const parse = value => {
    const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    const [, year, month, day] = match.map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
  };
  const first = parse(start), last = parse(end);
  if (!first || !last || last < first) return null;
  const total = Math.round((last - first) / 86400000) + 1;
  let days = Math.floor(total / 7) * 5;
  for (let offset = 0; offset < total % 7; offset++) {
    const weekday = (first.getUTCDay() + offset) % 7;
    if (weekday !== 0 && weekday !== 6) days++;
  }
  return days;
}
