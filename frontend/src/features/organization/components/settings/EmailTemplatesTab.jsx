import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Mail, Pencil, Search, Send, Eye, CheckCircle2 } from 'lucide-react'
import { getApiErrorMessage } from '@shared/services/apiServices'
import { fetchEmailTemplates, saveEmailTemplate, sendTestEmail } from '@shared/services/organizationSettingsService'
import { readLocalList, writeLocalList } from '@shared/services/localSettingsStore'
import { EMAIL_TEMPLATES, renderTemplatePreview } from '@features/organization/data/settingsConstants'
import Modal from '@shared/components/Modal'
import {
  EmailTemplateSkeleton, InputField, SectionHeader, SettingsEmptyState, SettingsErrorState, TextareaField, Toggle,
} from './settingsUi'

const LOCAL_KEY = 'emailTemplates'

const normalizeTemplate = (template, index) => {
  const source = template?.template ?? template
  return {
    id: source.id ?? source.templateId ?? source.key ?? `template-${index}`,
    name: source.name ?? source.templateName ?? 'Untitled Template',
    description: source.description ?? '',
    subject: source.subject ?? '',
    body: source.body ?? source.content ?? '',
    status: String(source.status ?? 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active',
    variables: source.variables ?? [],
    updatedAt: source.updatedAt ?? source.lastUpdated ?? null,
  }
}

const mergeLocalOverrides = (templates) => {
  const overrides = readLocalList(LOCAL_KEY, [])
  if (!overrides.length) return templates
  return templates.map((template) => {
    const local = overrides.find((item) => item.id === template.id)
    return local ? { ...template, ...local } : template
  })
}

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
    status === 'active'
      ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
  }`}>
    <span className={`h-1.5 w-1.5 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`} />
    {status === 'active' ? 'Active' : 'Inactive'}
  </span>
)

export default function EmailTemplatesTab({ onNotify, onDirtyChange, editable = true }) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // template object being edited
  const [previewMode, setPreviewMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [dirty, setDirty] = useState(false)
  const templatesRef = useRef([])

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setLoadError(false)
      let rows
      let local = false
      try {
        rows = await fetchEmailTemplates()
        if (!Array.isArray(rows) || rows.length === 0) throw new Error('empty')
      } catch {
        rows = EMAIL_TEMPLATES
        local = true
      }
      const normalized = rows.map(normalizeTemplate)
      const merged = local ? mergeLocalOverrides(normalized) : normalized
      if (active) {
        templatesRef.current = merged
        setTemplates(merged)
        setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  useEffect(() => {
    onDirtyChange?.(dirty)
  }, [dirty, onDirtyChange])

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return templates
    return templates.filter((template) =>
      template.name.toLowerCase().includes(query) || template.subject.toLowerCase().includes(query),
    )
  }, [templates, search])

  const openEditor = (template) => {
    setEditing({ ...template })
    setPreviewMode(false)
    setTestEmail(localStorage.getItem('organizationEmail') || localStorage.getItem('user_email') || '')
    setDirty(false)
  }

  const closeEditor = () => {
    setEditing(null)
    setPreviewMode(false)
    setDirty(false)
  }

  const updateEditor = (field, value) => {
    setEditing((current) => ({ ...current, [field]: value }))
    setDirty(true)
  }

  const insertVariable = (variable) => {
    if (!editing) return
    const token = `{{${variable}}}`
    setEditing((current) => ({ ...current, body: `${current.body}${current.body.endsWith('\n') || !current.body ? '' : '\n'}${token}` }))
    setDirty(true)
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    const payload = {
      name: editing.name,
      subject: editing.subject,
      body: editing.body,
      status: editing.status,
    }
    const saved = { ...editing }
    try {
      await saveEmailTemplate(editing.id, payload)
      onNotify?.('Email template saved successfully.')
    } catch {
      const overrides = readLocalList(LOCAL_KEY, [])
      writeLocalList(LOCAL_KEY, [
        ...overrides.filter((item) => item.id !== editing.id),
        saved,
      ])
      onNotify?.('Email template saved locally. The email service is not connected yet.', 'info')
    }
    const next = templatesRef.current.map((template) => (template.id === editing.id ? saved : template))
    templatesRef.current = next
    setTemplates(next)
    setSaving(false)
    setDirty(false)
    setEditing(null)
  }

  const handleSendTest = async () => {
    if (!editing || !testEmail.trim()) {
      onNotify?.('Enter a valid test email address.', 'error')
      return
    }
    setSendingTest(true)
    try {
      await sendTestEmail(editing.id, { email: testEmail.trim(), subject: editing.subject, body: editing.body })
      onNotify?.('Test email sent successfully.')
    } catch (error) {
      onNotify?.(getApiErrorMessage(error, 'Unable to send test email. Please check your email configuration.'), 'error')
    } finally {
      setSendingTest(false)
    }
  }

  if (loading) return <EmailTemplateSkeleton />
  if (loadError) {
    return <SettingsErrorState message="Unable to load email templates." onRetry={() => { setLoadError(false); setLoading(true); window.location.reload() }} />
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SectionHeader
        title="Email Templates"
        description="Communication templates used across the organization. Variables are replaced with real recipient data when emails are sent."
        action={
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search templates..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f55f7]/30 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/20 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
            />
          </div>
        }
      />

      {filteredTemplates.length === 0 ? (
        <SettingsEmptyState
          icon={FileText}
          title={search ? 'No templates match your search' : 'No email templates found'}
          description={search ? 'Try a different search term.' : 'Core templates are seeded by the backend when the email service is connected.'}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700/50">
          <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,2fr)_110px_140px_90px] gap-4 border-b border-slate-100 bg-slate-50/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-700/50 dark:bg-slate-800/40 md:grid">
            <span>Template</span>
            <span>Subject</span>
            <span>Status</span>
            <span>Last Updated</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="grid grid-cols-1 gap-2 px-5 py-3.5 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30 md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_110px_140px_90px] md:items-center md:gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0f55f7]/10">
                    <Mail className="w-4 h-4 text-[#0f55f7]" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{template.name}</p>
                    {template.description && <p className="truncate text-xs text-slate-400">{template.description}</p>}
                  </div>
                </div>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">{template.subject || '—'}</p>
                <StatusBadge status={template.status} />
                <p className="text-xs text-slate-400">
                  {template.updatedAt
                    ? new Date(template.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—'}
                </p>
                <div className="flex justify-start md:justify-end">
                  <button
                    onClick={() => openEditor(template)}
                    disabled={!editable}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-[#0f55f7]/40 hover:text-[#0f55f7] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor modal */}
      {editing && (
        <Modal
          open
          onClose={closeEditor}
          title="Edit Email Template"
          description={editing.description || editing.name}
          size="lg"
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Mail className="w-4 h-4" />
                {editing.name}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSendTest}
                  disabled={sendingTest}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {sendingTest ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" /> : <Send className="w-4 h-4" />}
                  Send Test
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editable}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0f55f7] px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <CheckCircle2 className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Test email input */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                label="Test Email"
                type="email"
                value={testEmail}
                onChange={(event) => setTestEmail(event.target.value)}
                icon={Mail}
                hint="Used by Send Test — defaults to your email."
              />
              <div className="flex items-end pb-1">
                <button
                  onClick={handleSendTest}
                  disabled={sendingTest || !testEmail.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#0f55f7]/30 bg-[#0f55f7]/5 px-4 py-2.5 text-sm font-semibold text-[#0f55f7] transition-colors hover:bg-[#0f55f7]/10 disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  Send Test
                </button>
              </div>
            </div>

            <InputField label="Template Name" value={editing.name} onChange={(event) => updateEditor('name', event.target.value)} icon={FileText} />
            <InputField label="Email Subject" value={editing.subject} onChange={(event) => updateEditor('subject', event.target.value)} icon={Mail} />

            {/* Edit / preview toggle */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex rounded-xl border border-slate-200 p-1 dark:border-slate-700">
                <button
                  onClick={() => setPreviewMode(false)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${!previewMode ? 'bg-[#0f55f7] text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setPreviewMode(true)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${previewMode ? 'bg-[#0f55f7] text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
              </div>
              <StatusBadge status={editing.status} />
            </div>

            {previewMode ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Preview</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{renderTemplatePreview(editing.subject)}</p>
                <div className="mt-3 whitespace-pre-line rounded-lg border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  {renderTemplatePreview(editing.body)}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">Preview uses safe sample values — nothing is stored.</p>
              </div>
            ) : (
              <div>
                <TextareaField
                  label="Email Body"
                  rows={12}
                  value={editing.body}
                  onChange={(event) => updateEditor('body', event.target.value)}
                />
                <div className="mt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Available Variables</p>
                  <div className="flex flex-wrap gap-1.5">
                    {editing.variables.length > 0 ? editing.variables.map((variable) => (
                      <button
                        key={variable}
                        onClick={() => insertVariable(variable)}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-medium text-[#0f55f7] transition-colors hover:bg-[#0f55f7]/10 dark:bg-slate-800 dark:text-blue-300"
                        title="Click to insert"
                      >
                        {`{{${variable}}}`}
                      </button>
                    )) : (
                      <p className="text-xs text-slate-400">No variables defined for this template.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-100 px-4 dark:border-slate-700/50">
              <Toggle
                label="Template Active"
                description="Inactive templates are not used when business events fire."
                checked={editing.status === 'active'}
                onChange={() => updateEditor('status', editing.status === 'active' ? 'inactive' : 'active')}
              />
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  )
}
