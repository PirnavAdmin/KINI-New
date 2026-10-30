import { ORGANIZATIONS } from '@shared/data/superAdminPageMockData'
import { SUBSCRIPTION_RECORDS } from '@shared/data/subscriptionMockData'
import { applyStatusOverrides, getStoredMockOrganizations } from '@shared/services/mockOrganizationService'
import { deriveSubscriptionStatus, isActiveSubscription } from '@shared/utils/subscriptionStatus'

const isActiveOrganization = (item) => String(item?.status || '').toLowerCase() === 'active'

export const getDemoOrganizationRows = () =>
  applyStatusOverrides([...getStoredMockOrganizations(), ...ORGANIZATIONS])

export const getDemoOrganizationMetrics = (rows = getDemoOrganizationRows()) => ({
  totalOrganizations: rows.length,
  activeOrganizations: rows.filter(isActiveOrganization).length,
})

export const getDemoSubscriptionRows = () =>
  SUBSCRIPTION_RECORDS.map((item) => {
    const status = deriveSubscriptionStatus(item)
    return {
      ...item,
      status,
      isActive: isActiveSubscription(status),
    }
  })

export const getDemoSubscriptionMetrics = (rows = getDemoSubscriptionRows()) => ({
  totalSubscriptions: rows.length,
  activeSubscriptions: rows.filter((item) => item.isActive).length,
  upcomingSubscriptions: rows.filter((item) => item.status === 'expiring').length,
})
