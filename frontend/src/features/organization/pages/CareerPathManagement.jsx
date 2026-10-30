import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  AlertCircle,
  CheckCircle,
  Edit3,
  Plus,
  Star,
  Trash2,
  TrendingUp,
  User,
} from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import Card from '@shared/components/Card'
import EmptyState from '@shared/components/EmptyState'
import Modal from '@shared/components/Modal'
import { Button, Input, Select } from '@shared/components/FormElements'
import { getApiErrorMessage } from '@shared/services/apiServices'
import careerPathService from '@shared/services/careerPathService'

const INITIAL_TRACK = { title: '', level: 'Entry-Level', stagesText: '' }

const LEVEL_OPTIONS = ['Entry-Level', 'Mid-Level', 'Senior-Level', 'Lead'].map((level) => ({
  value: level,
  label: level,
}))

const getEntityId = (item) =>
  item?.id ?? item?._id ?? item?.careerPathId ?? item?.career_path_id

const normalizeStage = (stage, index) => {
  if (typeof stage === 'string') return { name: stage, completed: false }
  return {
    ...stage,
    name: stage?.name ?? stage?.title ?? stage?.stageName ?? `Stage ${index + 1}`,
    completed: Boolean(stage?.completed ?? stage?.isCompleted),
  }
}

const normalizeTrack = (track = {}) => {
  const id = getEntityId(track)
  const sourceStages = track.stages ?? track.careerStages ?? track.milestones ?? []
  return {
    ...track,
    id,
    careerPathId: track.careerPathId ?? id,
    title: track.title ?? track.name ?? track.trackName ?? `Career Track #${id ?? '-'}`,
    level: track.level ?? track.experienceLevel ?? 'Entry-Level',
    employees: track.employees ?? track.employeeCount ?? track.assignedEmployees ?? 0,
    stages: (Array.isArray(sourceStages) ? sourceStages : []).map(normalizeStage),
  }
}

const buildPayload = (form) => ({
  title: form.title.trim(),
  level: form.level,
  stages: form.stagesText
    .split('\n')
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({ name, completed: false })),
})

const mergeTrack = (current, saved, payload) => normalizeTrack({
  ...current,
  ...payload,
  ...(saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}),
})

export default function CareerPathManagement() {
  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTrack, setEditingTrack] = useState(null)
  const [deleteTrack, setDeleteTrack] = useState(null)
  const [trackForm, setTrackForm] = useState(INITIAL_TRACK)

  const fetchCareerPaths = useCallback(async ({ showToast = true } = {}) => {
    setLoading(true)
    setLoadError('')
    try {
      const result = await careerPathService.list()
      const normalized = (Array.isArray(result) ? result : []).map(normalizeTrack)
      setPaths(normalized)
      return normalized
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to load career tracks')
      setLoadError(message)
      if (showToast) toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(fetchCareerPaths, 0)
    return () => window.clearTimeout(timer)
  }, [fetchCareerPaths])

  const openCreate = () => {
    setEditingTrack(null)
    setTrackForm(INITIAL_TRACK)
    setModalOpen(true)
  }

  const openEdit = (track) => {
    setEditingTrack(track)
    setTrackForm({
      title: track.title || '',
      level: track.level || 'Entry-Level',
      stagesText: track.stages.map((stage) => stage.name).join('\n'),
    })
    setModalOpen(true)
  }

  const closeForm = () => {
    if (saving) return
    setModalOpen(false)
    setEditingTrack(null)
    setTrackForm(INITIAL_TRACK)
  }

  const handleSave = async () => {
    const payload = buildPayload(trackForm)
    if (!payload.title) {
      toast.error('Track title is required')
      return
    }

    setSaving(true)
    try {
      if (editingTrack) {
        const id = getEntityId(editingTrack)
        if (id === undefined || id === null || id === '') throw new Error('Career track ID is missing')
        const saved = await careerPathService.update(id, payload)
        const updated = mergeTrack(editingTrack, saved, payload)
        setPaths((current) => current.map((track) =>
          String(getEntityId(track)) === String(id) ? updated : track
        ))
        toast.success('Career track updated successfully')
      } else {
        const saved = await careerPathService.create(payload)
        if (saved && typeof saved === 'object' && !Array.isArray(saved) && getEntityId(saved) != null) {
          setPaths((current) => [...current, mergeTrack(null, saved, payload)])
        } else {
          const refreshed = await fetchCareerPaths({ showToast: false })
          if (refreshed === null) throw new Error('Career track was created, but the latest list could not be loaded')
        }
        toast.success('Career track created successfully')
      }
      setModalOpen(false)
      setEditingTrack(null)
      setTrackForm(INITIAL_TRACK)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save career track'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const id = getEntityId(deleteTrack)
    if (id === undefined || id === null || id === '') {
      toast.error('Career track ID is missing')
      return
    }

    setSaving(true)
    try {
      await careerPathService.remove(id)
      setPaths((current) => current.filter((track) => String(getEntityId(track)) !== String(id)))
      setDeleteTrack(null)
      toast.success('Career track deleted successfully')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to delete career track'))
    } finally {
      setSaving(false)
    }
  }

  const stats = useMemo(() => {
    const stageTotal = paths.reduce((sum, path) => sum + path.stages.length, 0)
    return [
      { label: 'Career Tracks', value: paths.length, color: '#0f55f7', icon: TrendingUp },
      { label: 'Active Employees', value: paths.reduce((sum, path) => sum + Number(path.employees || 0), 0), color: '#10B981', icon: User },
      { label: 'Avg Stages', value: paths.length ? Math.round(stageTotal / paths.length) : 0, color: '#06b6a8', icon: Star },
    ]
  }, [paths])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-7xl min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:py-10 [&>div:first-child]:!mb-6"
    >
      <PageHeader
        title="Career Path Management"
        subtitle="Define career progression tracks for employees"
        icon={TrendingUp}
        actions={<Button onClick={openCreate} icon={Plus}>Add Track</Button>}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={stat.label} delay={index * 0.05} padding="p-4" className="group relative overflow-hidden !border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0f55f7]/5 dark:!border-slate-700">
            <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: stat.color }} />
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-slate-900/5 transition-transform duration-300 group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}08)` }}>
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {loadError && (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-red-500/20 dark:bg-red-500/10">
          <div className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchCareerPaths} disabled={loading}>Retry</Button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white/70 dark:border-slate-700/40 dark:bg-slate-900/60" />
          ))}
        </div>
      ) : paths.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/70">
          <EmptyState
            compact
            title="No career tracks found"
            description={loadError ? 'Career tracks could not be loaded from the API.' : 'Add a career track to define employee progression.'}
            icon={TrendingUp}
            action={!loadError ? <Button onClick={openCreate} icon={Plus}>Add Track</Button> : undefined}
          />
        </div>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
          {paths.map((path, index) => (
            <motion.div
              key={getEntityId(path)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700/40 dark:bg-slate-900/60"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">{path.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-400">{path.level} · {path.employees} employees</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => openEdit(path)} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={`Edit ${path.title}`}>
                    <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                  <button type="button" onClick={() => setDeleteTrack(path)} className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10" aria-label={`Delete ${path.title}`}>
                    <Trash2 className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              {path.stages.length ? (
                <div className="relative">
                  <div className="absolute bottom-2 left-[15px] top-2 w-0.5 bg-gradient-to-b from-[#0f55f7] via-[#06b6a8] to-slate-200 dark:to-slate-700" />
                  <div className="space-y-4">
                    {path.stages.map((stage, stageIndex) => (
                      <div key={stage.id ?? stage.stageId ?? `${stage.name}-${stageIndex}`} className="relative flex items-start gap-3">
                        <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${stage.completed ? 'bg-emerald-500' : 'border-2 border-dashed border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-800'}`}>
                          {stage.completed ? <CheckCircle className="h-4 w-4 text-white" /> : <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />}
                        </div>
                        <p className={`pt-1.5 text-sm font-medium ${stage.completed ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>{stage.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No stages have been added to this track.</p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeForm}
        title={editingTrack ? 'Edit Career Track' : 'Add Career Track'}
        description={editingTrack ? `Update ${editingTrack.title}` : 'Create a career progression track'}
        size="md"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={closeForm} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} icon={editingTrack ? null : Plus}>
              {editingTrack ? 'Save Changes' : 'Create Track'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Track Title"
            required
            value={trackForm.title}
            onChange={(event) => setTrackForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="e.g. Software Engineer Track"
          />
          <Select
            label="Level"
            required
            value={trackForm.level}
            onChange={(event) => setTrackForm((current) => ({ ...current, level: event.target.value }))}
            options={LEVEL_OPTIONS}
            placeholder=""
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Stages</label>
            <textarea
              rows={6}
              value={trackForm.stagesText}
              onChange={(event) => setTrackForm((current) => ({ ...current, stagesText: event.target.value }))}
              placeholder={'Junior Developer\nDeveloper\nSenior Developer'}
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#0f55f7] focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
            />
            <p className="text-xs text-slate-400">Enter one stage per line.</p>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTrack)}
        onClose={() => !saving && setDeleteTrack(null)}
        title="Delete Career Track"
        description={`Delete ${deleteTrack?.title || 'this career track'}? This action cannot be undone.`}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteTrack(null)} disabled={saving}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={saving} icon={Trash2}>Delete</Button>
          </div>
        }
      />
    </motion.div>
  )
}
