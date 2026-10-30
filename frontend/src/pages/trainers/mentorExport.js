export function downloadMentors(trainers, filename = 'mentors.csv') {
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const rows = [
    ['Name', 'Employee ID', 'Email', 'Mobile', 'Department', 'Designation', 'Courses', 'Batches', 'Students', 'Status'],
    ...trainers.map((trainer) => [trainer.name, trainer.employeeId, trainer.email, trainer.mobile, trainer.department, trainer.designation, trainer.courses?.join?.(', ') ?? trainer.courses, trainer.batches, trainer.students, trainer.status]),
  ];
  const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map((row) => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  try { link.click(); } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
