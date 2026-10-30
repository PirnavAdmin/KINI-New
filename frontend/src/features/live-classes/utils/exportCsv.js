const CSV_COLUMNS = [
  ['title', 'Class'],
  ['description', 'Description'],
  ['batchName', 'Batch'],
  ['courseName', 'Course'],
  ['mentorName', 'Mentor'],
  ['dateLabel', 'Date'],
  ['timeLabel', 'Time'],
  ['durationLabel', 'Duration'],
  ['platform', 'Platform'],
  ['statusLabel', 'Status'],
  ['attendancePercentage', 'Attendance %'],
  ['meetingUrl', 'Meeting Link'],
];

const CSV_BOM = String.fromCharCode(0xfeff);

const escapeCsvValue = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  if (/["\n,]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
};

export const exportLiveClassesToCsv = (rows = [], filename = 'live-classes.csv') => {
  if (!rows.length || typeof document === 'undefined') return false;

  const header = CSV_COLUMNS.map(([, label]) => escapeCsvValue(label)).join(',');
  const lines = rows.map((row) => CSV_COLUMNS.map(([key]) => escapeCsvValue(row[key])).join(','));
  const csv = [header, ...lines].join('\n');

  const blob = new Blob([CSV_BOM, csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};

export default exportLiveClassesToCsv;
