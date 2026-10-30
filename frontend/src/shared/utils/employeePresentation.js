export const normalizeEmploymentType = (value) => {
  const text = String(value ?? '').trim();
  const key = text.toLowerCase().replace(/[\s_-]/g, '');
  return ({ fulltime: 'Full-time', parttime: 'Part-time', contract: 'Contract', contractor: 'Contract', contractual: 'Contract', intern: 'Intern', internship: 'Intern' })[key] ?? text;
};

export const normalizeEmployeeStatus = (status) => {
  if (typeof status === 'boolean') return status ? 'active' : 'inactive';
  const value = String(status ?? '').trim().toLowerCase();
  if (value === 'enabled') return 'active';
  if (['disabled', 'deactivated'].includes(value)) return 'inactive';
  return value || 'active';
};
