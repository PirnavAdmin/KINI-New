export const normalizeEmploymentType = (value) => {
  const text = String(value ?? '').trim();
  const key = text.toLowerCase().replace(/[\s_-]/g, '');
  return ({ fulltime: 'Full-time', parttime: 'Part-time', contract: 'Contract', contractor: 'Contract', contractual: 'Contract', intern: 'Intern', internship: 'Intern' })[key] ?? text;
};

export function formatEmployeeAddress(record = {}) {
  if (typeof record.address === 'string' && record.address.trim()) return record.address;
  if (typeof record.fullAddress === 'string' && record.fullAddress.trim()) return record.fullAddress;
  const address = record.address ?? {};
  return [...new Set([address.line1 ?? address.addressLine1 ?? record.addressLine1,
    address.line2 ?? address.addressLine2 ?? record.addressLine2,
    record.houseNumber, record.streetArea, address.city ?? record.city, record.district,
    address.state ?? record.state, address.country?.name ?? address.country ?? record.country?.name ?? record.country,
    address.pincode ?? record.pincode ?? record.postalCode,
  ].filter(value => ['string', 'number'].includes(typeof value) && String(value).trim()))].join(', ');
}

export const normalizeEmployeeStatus = (status) => {
  if (typeof status === 'boolean') return status ? 'active' : 'inactive';
  const value = String(status ?? '').trim().toLowerCase();
  if (value === 'enabled') return 'active';
  if (['disabled', 'deactivated'].includes(value)) return 'inactive';
  return value || 'active';
};
export function matchesEmployeeSearch(employee, search) {
  const normalize = value => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
  const term = normalize(search)
  if (!term) return true
  const fields = [employee.fullName, employee.name, [employee.firstName, employee.lastName].filter(Boolean).join(' '), employee.email, employee.phone, employee.phoneNumber, employee.mobile, employee.designation, employee.role, employee.roleName, employee.employeeCode, employee.employeeId]
  if (fields.some(value => normalize(value).includes(term))) return true
  const digits = term.replace(/\D/g, '')
  return /^[+\d\s()-]+$/.test(term) && digits.length > 0 && [employee.phone, employee.phoneNumber, employee.mobile].some(value => String(value ?? '').replace(/\D/g, '').includes(digits))
}

