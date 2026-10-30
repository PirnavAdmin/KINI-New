import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, Bell, Building2, FileText, Globe, Settings2, ShieldCheck,
} from 'lucide-react'
import usePermission from '@shared/hooks/usePermission'
import { SETTINGS_TABS } from '@features/organization/data/settingsConstants'
import Modal from '@shared/components/Modal'
import { Toast } from '@features/organization/components/settings/settingsUi'
import OrganizationTab from '@features/organization/components/settings/OrganizationTab'
import InvoiceTab from '@features/organization/components/settings/InvoiceTab'
import EmailTemplatesTab from '@features/organization/components/settings/EmailTemplatesTab'
import GeneralTab from '@features/organization/components/settings/GeneralTab'
import RolesPermissionsTab from '@features/organization/components/settings/RolesPermissionsTab'
import NotificationsTab from '@features/organization/components/settings/NotificationsTab'

const TAB_ICONS = {
  organization: Building2,
  invoice: FileText,
  'email-templates': Globe,
  general: Settings2,
  roles: ShieldCheck,
  notifications: Bell,
}

/* Permission requirements per tab: view permission + edit permission. */
const TAB_PERMISSIONS = {
  organization: { view: 'settings', edit: 'settings.editOrganization' },
  invoice: { view: 'settings', edit: 'settings.editInvoice' },
  'email-templates': { view: 'settings', edit: 'settings.editEmail' },
  general: { view: 'settings', edit: 'settings.editGeneral' },
  roles: { view: 'roles.view', edit: 'roles.managePermissions' },
  notifications: { view: 'settings', edit: 'settings.editNotifications' },
}

const getTabIcon = (tabId) => TAB_ICONS[tabId] || Settings2

const OrganizationSettingsPage = () => {
  const location = useLocation()
  const { hasPermission } = usePermission()

  const initialTab = useMemo(() => {
    const param = new URLSearchParams(location.search).get('tab')
    return SETTINGS_TABS.some((tab) => tab.id === param) ? param : 'organization'
  }, [location.search])

  const [activeTab, setActiveTab] = useState(initialTab)
  const [dirty, setDirty] = useState(false)
  const [pendingTab, setPendingTab] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type })
    window.setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500)
  }, [])

  const handleDirtyChange = useCallback((isDirty) => {
    setDirty(Boolean(isDirty))
  }, [])

  /* Block accidental navigation away with unsaved changes. */
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!dirty) return undefined
      event.preventDefault()
      event.returnValue = ''
      return ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [dirty])

  const visibleTabs = useMemo(
    () => SETTINGS_TABS.filter((tab) => {
      const requirements = TAB_PERMISSIONS[tab.id]
      return hasPermission(requirements.view)
    }),
    [hasPermission],
  )

  const handleTabSelect = (tabId) => {
    if (tabId === activeTab) return
    if (dirty) {
      setPendingTab(tabId)
      return
    }
    setActiveTab(tabId)
  }

  const confirmDiscard = () => {
    setDirty(false)
    setActiveTab(pendingTab)
    setPendingTab(null)
  }

  const editable = hasPermission(TAB_PERMISSIONS[activeTab]?.edit)

  const renderTabContent = () => {
    const commonProps = { onNotify: showToast, onDirtyChange: handleDirtyChange, editable }
    switch (activeTab) {
      case 'organization':
        return <OrganizationTab {...commonProps} />
      case 'invoice':
        return <InvoiceTab {...commonProps} />
      case 'email-templates':
        return <EmailTemplatesTab {...commonProps} />
      case 'general':
        return <GeneralTab {...commonProps} />
      case 'roles':
        return <RolesPermissionsTab {...commonProps} />
      case 'notifications':
        return <NotificationsTab {...commonProps} />
      default:
        return null
    }
  }

  return (
    <div className="w-full min-w-0 px-1 pb-6 pt-0 sm:px-1.5">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10 shadow-sm">
            <Settings2 className="w-5 h-5 text-[#0f55f7]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">Settings</h1>
            <p className="text-sm text-slate-400">Manage organization configuration, security and communication preferences.</p>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-slate-200/70 bg-slate-100/80 p-1 dark:border-slate-700/60 dark:bg-slate-800/50">
        {visibleTabs.map((tab) => {
          const Icon = getTabIcon(tab.id)
          return (
            <button
              key={tab.id}
              data-testid={`settings-tab-${tab.id}`}
              onClick={() => handleTabSelect(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-white text-[#0f55f7] shadow-sm dark:bg-slate-700'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-[0_14px_32px_-28px_rgba(15,23,42,0.4)] dark:border-slate-700/60 dark:bg-slate-900/50 sm:p-5">
        {!editable && activeTab !== 'roles' && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            You have view-only access to this section. Changes are disabled.
          </div>
        )}
        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>
      </div>

      {/* Unsaved changes confirm */}
      <Modal
        open={Boolean(pendingTab)}
        onClose={() => setPendingTab(null)}
        title="Unsaved changes"
        description="You have unsaved changes in this section."
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setPendingTab(null)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Continue Editing
            </button>
            <button
              onClick={confirmDiscard}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110"
            >
              Discard Changes
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Switching sections will discard your current edits. Save this section before continuing if you want to keep them.
        </p>
      </Modal>

      {/* Toast */}
      <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  )
}

export default OrganizationSettingsPage
