import { employeeService } from './employeeService';
import { mentorService } from './mentorService';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

export async function saveManagedMentor(record, values) {
  const names = String(values.name || '').trim().split(/\s+/);
  const employeeRecord = record?.employeeRecordId != null;
  const allowed = employeeRecord
    ? ['name', 'email', 'mobile', 'designation', 'joiningDate', 'type', 'active']
    : ['name', 'email', 'mobile', 'courseIds', 'courses', 'active'];
  const unsupported = (values.changedFields || []).filter((field) => !allowed.includes(field));
  if (unsupported.length) {
    throw new Error(`These changes cannot currently be saved: ${unsupported.join(', ')}. Keep those fields unchanged and save the other details.`);
  }
  const details = {
    firstName: names[0] || '', lastName: names.slice(1).join(' '),
    email: values.email, phone: values.mobile,
  };
  if (employeeRecord) {
    const employeeId = record.employeeRecordId;
    const result = await employeeService.updateEmployee(employeeId, {
      ...details, role: record.role || 'Mentor', designation: values.designation,
      employeeType: values.type, joiningDate: values.joiningDate || null,
      status: values.active ? 'Active' : 'Inactive',
    });
    if (result?.success === false) throw new Error(result.message || 'Unable to save mentor.');
    return unwrap(await employeeService.getEmployee(employeeId));
  }
  const payload = { ...details, courseIds: values.courseIds, status: values.active };
  const mentorId = record?.mentorId ?? record?.tutorId ?? record?.id;
  const response = mentorId != null
    ? await mentorService.updateMentor(mentorId, payload)
    : await mentorService.createMentor(payload);
  if (response?.success === false) throw new Error(response.message || 'Unable to save mentor.');
  const saved = unwrap(response);
  const savedId = mentorId ?? saved?.mentorId ?? saved?.id;
  if (savedId == null) throw new Error('The saved mentor ID was not returned. Refresh the list before trying again.');
  return unwrap(await mentorService.getMentor(savedId));
}
