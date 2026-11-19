import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AtSign, CheckCircle2, ImagePlus, QrCode, Smartphone, Trash2, UserRound } from 'lucide-react'
import ApiImage from '@shared/components/ApiImage'
import { getApiErrorMessage } from '@shared/services/apiServices'
import { upiPaymentApi } from '@shared/services/upiPaymentService'
import { InputField, SaveButton, SectionHeader, SettingsErrorState, SettingsSkeleton } from './settingsUi'

const UPI_ID_PATTERN = /^[A-Za-z0-9._-]{2,256}@[A-Za-z][A-Za-z0-9.]{1,63}$/
const QR_TYPES = ['image/png', 'image/jpeg', 'image/jpg']
const QR_MAX_BYTES = 2 * 1024 * 1024

/**
 * Settings → Payments: the organization's UPI ID, payee name and QR code that
 * students see on the checkout payment step
 * (GET / POST / PUT /api/v1/organization/payment-settings).
 */
const PaymentsTab = ({ onNotify, onDirtyChange, editable }) => {
  const [state, setState] = useState({ loading: true, error: '', exists: false })
  const [saved, setSaved] = useState({ upiId: '', payeeName: '', qrCode: '' })
  const [form, setForm] = useState({ upiId: '', payeeName: '' })
  const [qrFile, setQrFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)
  const saveInFlight = useRef(false)

  const qrPreview = useMemo(() => (qrFile ? URL.createObjectURL(qrFile) : null), [qrFile])
  useEffect(() => () => { if (qrPreview) URL.revokeObjectURL(qrPreview) }, [qrPreview])

  const load = useCallback(async () => {
    setState((value) => ({ ...value, loading: true, error: '' }))
    try {
      const settings = await upiPaymentApi.getSettings()
      const next = { upiId: settings.upiId || '', payeeName: settings.payeeName || '', qrCode: settings.qrCode || '' }
      setSaved(next)
      setForm({ upiId: next.upiId, payeeName: next.payeeName })
      setQrFile(null)
      setErrors({})
      setState({ loading: false, error: '', exists: Boolean(next.upiId) })
      return true
    } catch (error) {
      setState({ loading: false, error: getApiErrorMessage(error, 'Unable to load UPI payment settings.'), exists: false })
      return false
    }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const dirty = form.upiId !== saved.upiId || form.payeeName !== saved.payeeName || Boolean(qrFile)
  useEffect(() => { onDirtyChange?.(dirty) }, [dirty, onDirtyChange])

  const update = (field) => (event) => {
    setForm((value) => ({ ...value, [field]: event.target.value }))
    setErrors((value) => ({ ...value, [field]: undefined }))
  }

  const pickQr = (file) => {
    if (!file) return
    if (!QR_TYPES.includes(file.type)) { setErrors((value) => ({ ...value, qr: 'Upload a PNG or JPG image.' })); return }
    if (file.size > QR_MAX_BYTES) { setErrors((value) => ({ ...value, qr: 'The QR image must be 2 MB or smaller.' })); return }
    setErrors((value) => ({ ...value, qr: undefined }))
    setQrFile(file)
  }

  const save = async () => {
    if (!editable || saveInFlight.current) return
    const upiId = form.upiId.trim()
    const payeeName = form.payeeName.trim()
    const next = {}
    if (!upiId) next.upiId = 'UPI ID is required.'
    else if (!UPI_ID_PATTERN.test(upiId)) next.upiId = 'Enter a valid UPI ID, e.g. institute@okaxis.'
    if (!payeeName) next.payeeName = 'Payee name is required.'
    else if (payeeName.length > 200) next.payeeName = 'Payee name must be 200 characters or fewer.'
    setErrors(next)
    if (Object.keys(next).length) return

    saveInFlight.current = true
    setSaving(true)
    try {
      const payload = { upiId, payeeName, qrCodeImage: qrFile }
      if (state.exists) await upiPaymentApi.updateSettings(payload)
      else await upiPaymentApi.createSettings(payload)
      if (await load()) onNotify?.('UPI payment settings saved')
      else onNotify?.('The save request completed, but the saved UPI settings could not be reloaded. Please retry loading the tab.', 'error')
    } catch (error) {
      onNotify?.(getApiErrorMessage(error, 'Unable to save UPI payment settings.'), 'error')
    } finally {
      saveInFlight.current = false
      setSaving(false)
    }
  }

  if (state.loading) return <SettingsSkeleton />
  if (state.error) return <SettingsErrorState message={state.error} onRetry={load} />

  const shownQr = qrPreview || saved.qrCode

  return (
    <motion.div key="payments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <SectionHeader
        title="UPI Payment Settings"
        description="Students pay course fees to this UPI account, then submit the UTR and a screenshot for your team to verify."
        action={state.exists ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Active
          </span>
        ) : (
          <span className="whitespace-nowrap rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">Not set up</span>
        )}
      />

      {!state.exists && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Students can&apos;t complete a UPI checkout until you add your UPI details.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <fieldset disabled={!editable || saving} className="space-y-4">
          <InputField
            label="UPI ID"
            icon={AtSign}
            value={form.upiId}
            onChange={update('upiId')}
            placeholder="institute@okaxis"
            error={errors.upiId}
            hint="The VPA students pay to. Copied into every UPI app link."
            maxLength={150}
            autoComplete="off"
          />
          <InputField
            label="Payee Name"
            icon={UserRound}
            value={form.payeeName}
            onChange={update('payeeName')}
            placeholder="Kini EduHub Pvt Ltd"
            error={errors.payeeName}
            hint="Shown to students next to the UPI ID. Use the name on the bank account."
            maxLength={200}
          />

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">QR Code Image <span className="font-normal text-slate-400">(optional)</span></p>
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => { event.preventDefault(); if (editable) pickQr(event.dataTransfer.files?.[0]) }}
              className={`flex items-center gap-4 rounded-xl border border-dashed p-4 ${errors.qr ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'} bg-slate-50/70 dark:bg-slate-800/40`}
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-[#0f55f7] shadow-sm dark:bg-slate-800">
                <ImagePlus className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1 text-sm">
                <p className="text-slate-600 dark:text-slate-300">
                  {qrFile ? <span className="font-semibold text-slate-900 dark:text-white">{qrFile.name}</span> : 'Upload the QR code from your bank or UPI app'}
                </p>
                <p className="text-xs text-slate-400">PNG or JPG, max 2 MB{saved.qrCode && !qrFile ? ' · leave empty to keep the current QR' : ''}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {qrFile && (
                  <button type="button" onClick={() => setQrFile(null)} aria-label="Remove selected QR image" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 dark:border-slate-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button type="button" onClick={() => fileRef.current?.click()} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-[#0f55f7] hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {saved.qrCode || qrFile ? 'Replace' : 'Choose file'}
                </button>
              </div>
              <input ref={fileRef} type="file" accept={QR_TYPES.join(',')} className="sr-only" onChange={(event) => { pickQr(event.target.files?.[0]); event.target.value = '' }} />
            </div>
            {errors.qr && <p className="text-xs font-medium text-red-600">{errors.qr}</p>}
            {!saved.qrCode && !qrFile && (
              <p className="text-xs text-slate-500">Without a QR image, students pay using the UPI ID and app buttons only.</p>
            )}
          </div>

          {editable && <SaveButton onSave={save} saving={saving} disabled={!dirty} label={state.exists ? 'Save Changes' : 'Save UPI Settings'} />}
        </fieldset>

        {/* What the student sees */}
        <aside aria-label="Student checkout preview" className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-5 dark:border-slate-700 dark:from-slate-800/60 dark:to-slate-900/60">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><Smartphone className="h-3.5 w-3.5" /> Student checkout preview</p>
          <div className="mx-auto mt-4 grid aspect-square w-full max-w-[200px] place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700">
            <ApiImage
              value={shownQr}
              alt="UPI QR code"
              className="h-full w-full object-contain"
              fallback={<span className="flex flex-col items-center gap-2 text-center text-xs text-slate-400"><QrCode className="h-10 w-10" />No QR image</span>}
            />
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
              <dt className="text-xs font-semibold uppercase text-slate-400">UPI ID</dt>
              <dd className="truncate font-semibold text-slate-900 dark:text-white">{form.upiId.trim() || '—'}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
              <dt className="whitespace-nowrap text-xs font-semibold uppercase text-slate-400">Payee Name</dt>
              <dd className="truncate font-semibold text-slate-900 dark:text-white">{form.payeeName.trim() || '—'}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </motion.div>
  )
}

export default PaymentsTab
