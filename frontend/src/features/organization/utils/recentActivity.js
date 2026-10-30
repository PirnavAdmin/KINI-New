// Recent Activity on the organization dashboard: the newest records from the
// organization's notifications and its own student/employee/batch/class
// records, newest first. Items: { key?, type, text, detail?, timestamp, path }.

export const RECENT_ACTIVITY_LIMIT = 5;

/** Epoch ms of a valid timestamp, or null when it is missing or unparseable. */
export const activityTimeOf = (item) => {
  const value = item?.timestamp;
  if (value === null || value === undefined || value === "") return null;
  const time = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(time) ? time : null;
};

// Two entries are the same activity when they share a record key (a polled
// notification seen twice) or when the same message lands within the same
// minute from two sources (a notification and the record it announces).
const textKey = (item) => {
  const text = String(item?.text ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  const time = activityTimeOf(item);
  return `${text}|${time === null ? "undated" : Math.floor(time / 60000)}`;
};

/**
 * The latest `limit` activities, newest first, without duplicates. Entries
 * without a valid timestamp keep their source order after all dated ones.
 */
export function latestActivity(items, limit = RECENT_ACTIVITY_LIMIT) {
  const seen = new Set();
  const unique = [];
  for (const item of Array.isArray(items) ? items : []) {
    if (!item || typeof item !== "object" || !String(item.text ?? "").trim()) continue;
    const keys = [item.key, textKey(item)].filter(Boolean);
    if (keys.some((key) => seen.has(key))) continue;
    keys.forEach((key) => seen.add(key));
    unique.push(item);
  }
  return unique
    .map((item, index) => ({ item, index, time: activityTimeOf(item) }))
    .sort((a, b) => {
      if (a.time === null || b.time === null) {
        if (a.time === b.time) return a.index - b.index;
        return a.time === null ? 1 : -1;
      }
      return b.time - a.time || a.index - b.index;
    })
    .slice(0, limit)
    .map(({ item }) => item);
}
