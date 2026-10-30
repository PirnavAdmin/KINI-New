export const getInitials = (value = '') => String(value || '')
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part.charAt(0))
  .join('')
  .toUpperCase() || 'LC'
