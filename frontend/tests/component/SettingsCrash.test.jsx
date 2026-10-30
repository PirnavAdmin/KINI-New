import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

/* Network layer mocked to fail like a missing backend — every tab must fall
   back gracefully instead of throwing. Any uncaught render error will fail
   this test with the real exception message. */
vi.mock('@shared/services/apiClient', () => ({
  default: {
    get: vi.fn(() => Promise.reject(new Error('Request failed with status code 404'))),
    post: vi.fn(() => Promise.reject(new Error('Request failed with status code 404'))),
    put: vi.fn(() => Promise.reject(new Error('Request failed with status code 404'))),
    delete: vi.fn(() => Promise.reject(new Error('Request failed with status code 404'))),
  },
}))

vi.mock('@shared/hooks/usePermission', () => ({
  default: () => ({ hasPermission: () => true, can: () => true, permissions: ['*'] }),
}))

import OrganizationSettingsPage from '@features/organization/pages/OrganizationSettingsPage'

describe('Organization Settings page (/organization/settings)', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('organization_id', '2')
    localStorage.setItem('organizationId', '2')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders the Settings hub without throwing when every API fails', async () => {
    render(
      <MemoryRouter initialEntries={['/organization/settings']}>
        <OrganizationSettingsPage />
      </MemoryRouter>,
    )

    // Page header + all six tabs must render
    expect(await screen.findByRole('heading', { name: /settings/i })).toBeInTheDocument()
    const tabLabels = ['Organization', 'Invoice', 'Email Templates', 'General', 'Roles & Permissions', 'Notifications']
    for (const label of tabLabels) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    }
  })

  it('switches through every tab without throwing (API failure path)', async () => {
    render(
      <MemoryRouter initialEntries={['/organization/settings']}>
        <OrganizationSettingsPage />
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: /settings/i })

    const switchTab = async (label) => {
      const element = screen.getAllByText(label).find((el) => el.closest('button'))
      expect(element, `tab ${label}`).toBeTruthy()
      fireEvent.click(element.closest('button'))
    }

    // Organization (default) already rendered. Exercise the rest.
    await switchTab('Invoice')
    await switchTab('Email Templates')
    await switchTab('General')
    await switchTab('Roles & Permissions')
    await switchTab('Notifications')

    // Back to Organization to confirm full round-trip works.
    await switchTab('Organization')
  })
})
