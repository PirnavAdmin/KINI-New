import { useEffect, useState } from 'react';

// Returning to the tab fires both `focus` and `visibilitychange`; refreshes
// closer together than this count as one.
const MIN_REFRESH_GAP_MS = 5000;

export default function useClassRefresh() {
  const [updatedAt, setUpdatedAt] = useState(Date.now);
  useEffect(() => {
    let last = Date.now();
    const refresh = () => {
      const now = Date.now();
      if (document.visibilityState === 'hidden' || now - last < MIN_REFRESH_GAP_MS) return;
      last = now;
      setUpdatedAt(now);
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    const timer = window.setInterval(refresh, 60000);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      window.clearInterval(timer);
    };
  }, []);
  return updatedAt;
}
