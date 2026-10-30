import { StrictMode, useContext } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../../src/shared/services/apiClient';
import { matchOrganizationMentor, resolveMentorIdentity } from '../../src/shared/services/mentorIdentityService';
import { AuthProvider } from '../../src/shared/context/AuthContext';
import { AuthContext } from '../../src/shared/context/AuthContextValue';

vi.mock('../../src/shared/services/apiClient', () => ({
  default: { get: vi.fn() }, clearAuthentication: vi.fn(),
}));

const identity = { userId: 42, employeeId: 9, organizationId: 3, email: 'mentor@example.com' };
const row = { mentorId: 27, employeeId: 9, organizationId: 3, email: 'MENTOR@example.com' };

beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

describe('mentor identity resolution', () => {
  it('uses the mentor ID from the matching organization record, not the employee ID', async () => {
    apiClient.get.mockImplementation(async (url) => ({ data: { data: url.endsWith('/mentors') ? { items: [row] } : {} } }));
    await expect(resolveMentorIdentity(identity)).resolves.toBe(27);
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/organization/mentors', expect.objectContaining({
      params: expect.objectContaining({ Search: identity.email }), skipAuthRedirect: true,
    }));
  });

  it('rejects another organization, conflicting IDs, ambiguous records and name-only matches', () => {
    expect(matchOrganizationMentor([{ ...row, organizationId: 4 }], identity)).toBeNull();
    expect(matchOrganizationMentor([{ ...row, userId: 99 }], identity)).toBeNull();
    expect(matchOrganizationMentor([row, { ...row, mentorId: 28 }], identity)).toBeNull();
    expect(matchOrganizationMentor([{ mentorId: 27, name: 'Mentor' }], identity)).toBeNull();
  });

  it('uses an explicit profile link without requesting the catalogue', async () => {
    apiClient.get.mockResolvedValue({ data: { data: { mentorId: 27 } } });
    await expect(resolveMentorIdentity(identity)).resolves.toBe(27);
    expect(apiClient.get).toHaveBeenCalledTimes(1);
  });

  it('preserves network and permission errors instead of reporting an unlinked account', async () => {
    const error = { response: { status: 403 } };
    apiClient.get.mockRejectedValue(error);
    await expect(resolveMentorIdentity(identity)).rejects.toBe(error);
  });
});

function Session() {
  const auth = useContext(AuthContext);
  return <><span data-testid="mentor">{auth.user?.mentorId ?? 'missing'}</span>
    <span data-testid="error">{auth.mentorIdResolutionError?.status ?? ''}</span>
    <button onClick={auth.retryMentorIdentity}>Retry</button></>;
}

it('restores a mentor session under StrictMode and retries a failed lookup', async () => {
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('role', 'mentor');
  localStorage.setItem('user', JSON.stringify({ ...identity, role: 'mentor' }));
  apiClient.get.mockRejectedValue({ response: { status: 503 } });
  render(<StrictMode><AuthProvider><Session /></AuthProvider></StrictMode>);
  await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('503'));
  apiClient.get.mockImplementation(async (url) => ({ data: { data: url.endsWith('/mentors') ? [row] : {} } }));
  fireEvent.click(screen.getByText('Retry'));
  await waitFor(() => expect(screen.getByTestId('mentor')).toHaveTextContent('27'));
  expect(localStorage.getItem('mentorId')).toBe('27');
  expect(screen.getByTestId('error')).toBeEmptyDOMElement();
});

it('finishes mentor resolution when employee enrichment updates the session', async () => {
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('role', 'mentor');
  localStorage.setItem('user', JSON.stringify({ userId: 42, email: identity.email, organizationId: 3, role: 'mentor' }));
  apiClient.get.mockImplementation(async (url) => ({ data: { data:
    url.endsWith('/mentors') ? [row] : { employeeId: 9 },
  } }));
  render(<StrictMode><AuthProvider><Session /></AuthProvider></StrictMode>);
  await waitFor(() => expect(screen.getByTestId('mentor')).toHaveTextContent('27'));
  expect(localStorage.getItem('employeeId')).toBe('9');
  expect(localStorage.getItem('mentorId')).toBe('27');
});
