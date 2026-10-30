// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Recent Platform Activity â†’ Detail page navigation
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Pure helpers that turn a lightweight activity record into the exact
// detail-page destination for the related entity. Navigation is always
// driven by real entity IDs (organizationId / subscriptionId / paymentId /
// userId) â€” never by display names â€” so the correct record opens even
// when several organizations share a similar name.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import { ROUTES } from '@shared/constants/routeConstants'

export const ACTIVITY_TYPES = {
  ORGANIZATION_REGISTERED: 'ORGANIZATION_REGISTERED',
  ORGANIZATION_APPROVED: 'ORGANIZATION_APPROVED',
  ORGANIZATION_SUSPENDED: 'ORGANIZATION_SUSPENDED',
  SUBSCRIPTION_ACTIVATED: 'SUBSCRIPTION_ACTIVATED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PLAN_UPDATED: 'PLAN_UPDATED',
  USER_ACCESS_CHANGED: 'USER_ACCESS_CHANGED',
}

// Activity types that resolve to an organization detail page.
const ORGANIZATION_TYPES = new Set([
  ACTIVITY_TYPES.ORGANIZATION_REGISTERED,
  ACTIVITY_TYPES.ORGANIZATION_APPROVED,
  ACTIVITY_TYPES.ORGANIZATION_SUSPENDED,
])

const SUBSCRIPTION_TYPES = new Set([
  ACTIVITY_TYPES.SUBSCRIPTION_ACTIVATED,
  ACTIVITY_TYPES.PLAN_UPDATED,
])

const PAYMENT_TYPES = new Set([
  ACTIVITY_TYPES.PAYMENT_RECEIVED,
  ACTIVITY_TYPES.PAYMENT_FAILED,
])

// Best-effort type inference for API events that only ship a human-readable
// title (mirrors the vocabulary used by the mock activity feed). Returns
// undefined when the title doesn't match a known activity type.
export const inferActivityType = (title = '') => {
  const text = String(title).trim().toLowerCase()
  if (!text) return undefined
  if (text.includes('registered')) return ACTIVITY_TYPES.ORGANIZATION_REGISTERED
  if (text.includes('approved')) return ACTIVITY_TYPES.ORGANIZATION_APPROVED
  if (text.includes('suspended')) return ACTIVITY_TYPES.ORGANIZATION_SUSPENDED
  if (text.includes('payment') && text.includes('failed')) return ACTIVITY_TYPES.PAYMENT_FAILED
  if (text.includes('payment') && text.includes('received')) return ACTIVITY_TYPES.PAYMENT_RECEIVED
  if (text.includes('access changed')) return ACTIVITY_TYPES.USER_ACCESS_CHANGED
  if (text.includes('plan updated')) return ACTIVITY_TYPES.PLAN_UPDATED
  if (text.includes('activated')) return ACTIVITY_TYPES.SUBSCRIPTION_ACTIVATED
  return undefined
}

// Normalizes an activity record coming from either the API or the static
// dataset so the dashboard always works with the same shape.
export const normalizeActivity = (item = {}) => {
  const type = String(item.type || item.activityType || inferActivityType(item.title) || '').toUpperCase()
  return {
    id: item.id ?? item.activityId,
    type,
    title: item.title,
    tone: item.tone ?? 'brand',
    organization: item.organizationName ?? item.organization ?? item.entityName ?? '',
    organizationId: item.organizationId ?? item.entityId,
    subscriptionId: item.subscriptionId,
    paymentId: item.paymentId,
    userId: item.userId,
    createdAt: item.createdAt ?? item.timestamp ?? item.time,
    time: item.time ?? item.createdAt ?? item.timestamp,
  }
}

// Resolves the destination for a single activity.
//
// `options.subscriptionByOrganization(organizationId)` lets the caller fill in
// a subscription ID when the activity only carries an organization ID (some
// subscription events don't include one) â€” without ever searching by name.
//
// Returns { path, state } to hand straight to the router, or null when the
// activity cannot be safely deep-linked (caller should show an error toast).
export const resolveActivityDestination = (activity, options = {}) => {
  const normalized = normalizeActivity(activity)
  const { type, organizationId, subscriptionId, paymentId, userId, organization } = normalized

  const orgState = organizationId
    ? { organization: { id: organizationId, name: organization } }
    : null

  if (ORGANIZATION_TYPES.has(type)) {
    if (!organizationId) return null
    return {
      path: ROUTES.SUPER_ADMIN.ORGANIZATION_DETAILS.replace(':organizationId', String(organizationId)),
      state: orgState,
    }
  }

  if (SUBSCRIPTION_TYPES.has(type)) {
    const resolvedSubscriptionId =
      subscriptionId || options.subscriptionByOrganization?.(organizationId)
    if (!resolvedSubscriptionId) return null
    return {
      path: ROUTES.SUPER_ADMIN.SUBSCRIPTION_DETAILS.replace(':subscriptionId', String(resolvedSubscriptionId)),
      state: {
        subscription: {
          subscriptionId: resolvedSubscriptionId,
          organizationId,
          organizationName: organization,
        },
      },
    }
  }

  if (PAYMENT_TYPES.has(type)) {
    if (!paymentId) return null
    return {
      path: ROUTES.SUPER_ADMIN.PAYMENT_DETAILS.replace(':paymentId', String(paymentId)),
      state: {
        payment: {
          id: paymentId,
          organizationId,
          organizationName: organization,
          subscriptionId,
        },
      },
    }
  }

  if (type === ACTIVITY_TYPES.USER_ACCESS_CHANGED) {
    if (!userId) return null
    return {
      path: ROUTES.SUPER_ADMIN.USER_DETAILS.replace(':userId', String(userId)),
      state: {
        user: { id: userId, organizationId, organization },
      },
    }
  }

  // Unknown activity type with no reliable entity link â€” do not guess.
  return null
}


