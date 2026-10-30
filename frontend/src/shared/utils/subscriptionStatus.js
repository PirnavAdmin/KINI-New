export const deriveSubscriptionStatus = (item = {}) => {
  const explicit = String(item.status || '').toLowerCase();
  if (explicit) return explicit;
  const expiry = Date.parse(item.endDate ?? item.expiryDate ?? item.renewalDate);
  if (!Number.isFinite(expiry)) return item.isActive === false ? 'inactive' : 'active';
  const days = Math.ceil((expiry - Date.now()) / 86400000);
  if (days < 0) return 'expired';
  if (days <= 30) return 'expiring';
  return 'active';
};
export const isActiveSubscription = (status) => ['active', 'expiring', 'trial'].includes(String(status).toLowerCase());
