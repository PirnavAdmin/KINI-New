/**
 * KINI EDUHUB — UI Store (Zustand)
 *
 * Lightweight UI state management for:
 *   - Sidebar collapse state
 *   - Global search open/close
 *   - Notification panel open/close
 *   - Any client-only UI toggles
 *
 * ⚠️ This replaces heavy Context usage for UI-only state.
 * Auth and Theme remain in Context (as they may
 * eventually need server-side hydration).
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUIStore = create(
  persist(
    (set) => ({
      // ── Sidebar ──────────────────────────────────────────────
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // ── Search ──────────────────────────────────────────────
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),
      toggleSearch: () =>
        set((state) => ({ searchOpen: !state.searchOpen })),

      // ── Notifications ────────────────────────────────────────
      notificationsOpen: false,
      setNotificationsOpen: (open) => set({ notificationsOpen: open }),
      toggleNotifications: () =>
        set((state) => ({ notificationsOpen: !state.notificationsOpen })),

      // ── Notification count (simulated) ──────────────────────
      notificationCount: 3,
      clearNotifications: () => set({ notificationCount: 0 }),
      addNotification: () =>
        set((state) => ({ notificationCount: state.notificationCount + 1 })),

      // ── Mobile sidebar ──────────────────────────────────────
      mobileSidebarOpen: false,
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      toggleMobileSidebar: () =>
        set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
    }),
    {
      name: 'kini-ui-store',
      partialize: (state) => ({
        // Only persist sidebar state across sessions
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)

export default useUIStore
