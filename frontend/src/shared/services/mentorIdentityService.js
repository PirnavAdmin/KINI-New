import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { getListPayload, getPayload } from './apiServices';

const present = (value) => value != null && String(value).trim() !== '';
const same = (a, b) => present(a) && present(b) && String(a).trim() === String(b).trim();
const email = (value) => String(value ?? '').trim().toLowerCase();

export const mentorIdFromProfile = (profile) => {
  const data = getPayload(profile);
  return data?.mentorId ?? data?.MentorId ?? data?.tutorId ?? data?.TutorId
    ?? data?.trainerId ?? data?.TrainerId
    ?? data?.personalInfo?.mentorId ?? data?.personalInfo?.MentorId
    ?? data?.PersonalInfo?.mentorId ?? data?.PersonalInfo?.MentorId
    ?? data?.mentor?.mentorId ?? data?.mentor?.id
    ?? data?.Mentor?.MentorId ?? data?.Mentor?.Id ?? null;
};

// Match an actual organization mentor row; user and employee IDs are never
// substituted for the mentor ID. Reject conflicting identities and ambiguity.
export const matchOrganizationMentor = (records, identity) => {
  const matches = records.filter((record) => {
    const org = record.organizationId ?? record.OrganizationId;
    const employee = record.employeeId ?? record.EmployeeId;
    const user = record.userId ?? record.UserId;
    if (present(org) && present(identity.organizationId) && !same(org, identity.organizationId)) return false;
    if (present(user) && present(identity.userId) && !same(user, identity.userId)) return false;
    if (present(employee) && present(identity.employeeId) && !same(employee, identity.employeeId)) return false;
    return same(user, identity.userId) || same(employee, identity.employeeId)
      || (email(identity.email) && email(record.email ?? record.Email) === email(identity.email));
  });
  if (matches.length !== 1) return null;
  const record = matches[0];
  return record.mentorId ?? record.MentorId ?? record.id ?? record.Id ?? null;
};

export const resolveMentorIdentity = async (identity) => {
  let lastError = null;
  const profileEndpoints = [API_ENDPOINTS.employeeProfile.base];
  if (present(identity.userId)) profileEndpoints.push(API_ENDPOINTS.auth.profile(identity.userId));
  for (const endpoint of profileEndpoints) {
    try {
      const profile = await apiClient.get(endpoint, { skipAuthRedirect: true });
      const mentorId = mentorIdFromProfile(profile);
      if (present(mentorId)) return mentorId;
    } catch (error) {
      lastError = error;
    }
  }

  // This is the same authenticated, organization-scoped catalogue used by
  // Mentor Management. The server still enforces access for the signed-in user.
  if (present(identity.email) || present(identity.employeeId) || present(identity.userId)) {
    try {
      const records = [];
      const seenPages = new Set();
      let page = 1;
      while (true) {
        const response = await apiClient.get(API_ENDPOINTS.organization.mentors, {
          skipAuthRedirect: true,
          params: { Search: identity.email || undefined, PageNumber: page, PageSize: 100 },
        });
        const batch = getListPayload(response);
        const signature = JSON.stringify(batch);
        if (batch.length && seenPages.has(signature)) throw new Error('Mentor catalogue pagination did not advance.');
        seenPages.add(signature);
        records.push(...batch);
        if (batch.length < 100) break;
        page += 1;
      }
      return matchOrganizationMentor(records, identity);
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) throw lastError;
  return null;
};
