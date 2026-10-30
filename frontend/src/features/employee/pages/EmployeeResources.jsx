import { useEffect, useRef, useState } from 'react'
import { FileText, Download, Eye, Search, RefreshCw, BookOpen, Users, Folder, FileCode2, LayoutGrid, List, MoreVertical } from 'lucide-react'
import { HrBreadcrumb, HrHero } from '@features/hr/components/portal/HrPortalKit'
import { heroProps } from '@features/hr/components/portal/hrHeroes'
import '@features/hr/components/portal/hr-resources.css'
import toast from 'react-hot-toast'
import Modal from '@shared/components/Modal'
import ResourcePreview from '../components/ResourcePreview'
import { learningResources, listEmployeeResources, loadResourceFile, resourceError, saveResourceFile } from '../services/employeeResourceService'

// Category shown on cards/filters; resources only carry a course name, so it is
// derived from keywords and falls back to the course itself.
const categoryOf = (resource) => {
  const text = `${resource.title} ${resource.course}`
  if (/react|express|node|mern|html|css|javascript|web/i.test(text)) return 'Web Development'
  if (/\bml\b|machine|ai\b|deep learning/i.test(text)) return 'Machine Learning'
  if (/python|pandas|data/i.test(text)) return 'Data Science'
  if (/typescript|git|docker|tool/i.test(text)) return 'Development Tools'
  return resource.course || 'General'
}
const TILE_TONES = ['red', 'blue', 'green', 'purple', 'orange', 'pink']

const button = 'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50'

export default function EmployeeResources() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const refreshPending = useRef(false)
  const [source, setSource] = useState('library')
  const [sharedList, setList] = useState({ rows: [], loading: true })
  const list = source === 'library' ? {
    rows: learningResources.filter(resource => `${resource.title} ${resource.course}`.toLowerCase().includes(search.trim().toLowerCase())),
    loading: false, hasNext: false,
  } : sharedList
  const [category, setCategory] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sort, setSort] = useState('latest')
  const [layout, setLayout] = useState('grid')
  const [menu, setMenu] = useState(null)
  const [preview, setPreview] = useState(null)
  const [downloading, setDownloading] = useState(null)
  const downloadLock = useRef(false)
  const previewController = useRef(null)
  const downloadController = useRef(null)
  const closeButton = useRef(null)

  useEffect(() => {
    if (source !== 'shared') return
    const controller = new AbortController()
    setList(current => ({ ...current, loading: true, error: '' }))
    const timer = setTimeout(async () => {
      try {
        const data = await listEmployeeResources({ Search: search.trim(), Page: page, Limit: 6 }, controller.signal)
        if (!controller.signal.aborted) {
          setList({ ...data, loading: false })
          if (refreshPending.current) toast.success('Shared resources refreshed.', { id: 'resource-refresh' })
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setList({ rows: [], loading: false, error: resourceError(error) })
          if (refreshPending.current) toast.error(resourceError(error), { id: 'resource-refresh' })
        }
      } finally {
        if (!controller.signal.aborted) { refreshPending.current = false; setRefreshing(false) }
      }
    }, 250)
    return () => { clearTimeout(timer); controller.abort() }
  }, [search, page, revision, source])
  useEffect(() => () => { previewController.current?.abort(); downloadController.current?.abort() }, [])
  const closePreview = () => { previewController.current?.abort(); setPreview(null) }
  const refresh = () => {
    if (refreshing || list.loading) return
    setMenu(null)
    setPage(1)
    if (source === 'library') {
      setSearch('')
      setCategory('all')
      setTypeFilter('all')
      setSort('latest')
      toast.success('Learning library refreshed.', { id: 'resource-refresh' })
      return
    }
    refreshPending.current = true
    setRefreshing(true)
    setRevision(value => value + 1)
  }
  const view = async resource => {
    previewController.current?.abort()
    const controller = new AbortController()
    previewController.current = controller
    setPreview({ resource, loading: true })
    try {
      const file = await loadResourceFile(resource, 'preview', controller.signal)
      if (!controller.signal.aborted) setPreview({ resource, file })
    } catch (error) {
      if (!controller.signal.aborted) setPreview({ resource, error: resourceError(error) })
    }
  }
  const download = async resource => {
    if (downloadLock.current) return
    downloadLock.current = true
    const controller = new AbortController()
    downloadController.current = controller
    setDownloading(resource.id)
    try {
      const file = await loadResourceFile(resource, 'download', controller.signal)
      if (controller.signal.aborted) return
      saveResourceFile(file)
      toast.success(`Download started: ${file.filename}`, { id: 'resource-download' })
    } catch (error) {
      if (!controller.signal.aborted) toast.error(resourceError(error), { id: 'resource-download' })
    } finally {
      downloadLock.current = false
      if (!controller.signal.aborted) setDownloading(null)
    }
  }
  const previewOpen = Boolean(preview)
  useEffect(() => {
    if (!previewOpen) return
    const previous = document.activeElement
    closeButton.current?.focus()
    const trapFocus = event => {
      if (event.key !== 'Tab') return
      const dialog = closeButton.current?.closest('[role="dialog"]')
      const targets = [...(dialog?.querySelectorAll('button:not(:disabled), [href], [tabindex="0"]') ?? [])]
      const first = targets[0]
      const last = targets.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', trapFocus)
    return () => { document.removeEventListener('keydown', trapFocus); previous?.focus() }
  }, [previewOpen])

  const categories = [...new Set(list.rows.map(categoryOf))]
  const types = [...new Set(list.rows.map(resource => String(resource.type || '').toLowerCase()).filter(Boolean))]
  const shown = list.rows
    .filter(resource => (category === 'all' || categoryOf(resource) === category) && (typeFilter === 'all' || String(resource.type).toLowerCase() === typeFilter))
    .sort((a, b) => sort === 'name' ? String(a.title).localeCompare(String(b.title)) : 0)
  return <div className="hrp-page hrr-page mx-auto w-full max-w-[1600px] space-y-4">
    <div>
      <HrBreadcrumb items={[{ label: 'Home', to: '/employee/hr-dashboard' }, { label: 'Employee' }, { label: 'Resources' }]} />
      <HrHero {...heroProps('resources')} actions={<button className="hrp-btn hrp-btn--white" onClick={refresh} disabled={list.loading || refreshing}><RefreshCw className={list.loading || refreshing ? 'animate-spin' : ''} />{refreshing ? 'Refreshing...' : 'Refresh'}</button>} />
    </div>
    <div className="hrr-tabs" aria-label="Resource collections">{[['library', 'Learning Library', BookOpen], ['shared', 'Shared by HR', Users]].map(([value, label, Icon]) => <button key={value} aria-pressed={source === value} onClick={() => { if (value === source) return; refreshPending.current = false; setRefreshing(false); setSource(value); setPage(1); setCategory('all'); setTypeFilter('all') }}><Icon aria-hidden="true" />{label}</button>)}</div>
    <div className="hrr-toolbar">
      <label className="hrr-search"><Search aria-hidden="true" /><input aria-label="Search resources" placeholder="Search resources by title, category, or keyword..." value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} /></label>
      <select aria-label="Category" value={category} onChange={event => setCategory(event.target.value)}><option value="all">All Categories</option>{categories.map(item => <option key={item}>{item}</option>)}</select>
      <select aria-label="Type" value={typeFilter} onChange={event => setTypeFilter(event.target.value)}><option value="all">All Types</option>{types.map(item => <option key={item} value={item}>{item.toUpperCase()}</option>)}</select>
      <select aria-label="Sort" value={sort} onChange={event => setSort(event.target.value)}><option value="latest">Sort by: Latest</option><option value="name">Sort by: Name</option></select>
      <span className="hrr-layout" role="group" aria-label="Layout"><button aria-pressed={layout === 'grid'} aria-label="Grid view" onClick={() => setLayout('grid')}><LayoutGrid /></button><button aria-pressed={layout === 'list'} aria-label="List view" onClick={() => setLayout('list')}><List /></button></span>
    </div>
    {source === 'library' && <p className="text-sm text-slate-500">Built-in study guides and code examples. Open a preview or download a copy.</p>}
    {list.loading ? <p role="status" className="rounded-xl border bg-white p-8 text-center text-slate-500">Loading resources...</p>
      : list.error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800"><p>{list.error}</p><button className={`${button} mt-3 border border-red-200`} onClick={() => setRevision(value => value + 1)}>Retry</button></div>
        : !shown.length ? <div className="rounded-xl border border-slate-200 bg-white px-5 py-14 text-center"><FileText className="mx-auto mb-3 text-slate-400" size={36} /><h2 className="font-semibold text-[#133b5d]">{search || category !== 'all' || typeFilter !== 'all' ? 'No matching resources' : 'No resources available'}</h2><p className="mt-2 text-sm text-slate-500">{search ? 'Try another search.' : 'Files will appear here when HR uploads and shares them.'}</p></div>
          : <div className={layout === 'grid' ? 'hrr-grid' : 'hrr-list'}>{shown.map((resource, index) => {
            const isCode = /code|js|ts|zip/i.test(String(resource.type))
            const Icon = isCode ? FileCode2 : FileText
            const key = resource.id ?? index
            return <article key={key} className="hrr-card">
              <span className={`hrr-card__tile is-${TILE_TONES[index % TILE_TONES.length]}`} aria-hidden="true"><Icon /></span>
              <div className="hrr-card__body">
                <div className="hrr-card__head">
                  <h2>{resource.title}</h2>
                  <span className={`hrr-type ${isCode ? 'is-code' : 'is-pdf'}`}>{String(resource.type || 'file').toUpperCase()}</span>
                  <div className="relative">
                    <button className="hrr-more" aria-label={`More actions for ${resource.title}`} aria-expanded={menu === key} onClick={() => setMenu(current => current === key ? null : key)}><MoreVertical /></button>
                    {menu === key && <div className="hrr-menu" role="menu" onMouseLeave={() => setMenu(null)}><button role="menuitem" disabled={resource.id == null} onClick={() => { setMenu(null); view(resource) }}>View</button><button role="menuitem" disabled={resource.id == null || downloading !== null} onClick={() => { setMenu(null); download(resource) }}>Download</button></div>}
                  </div>
                </div>
                <p className="hrr-card__course">{resource.course}</p>
                <p className="hrr-card__meta"><span><Folder aria-hidden="true" />{categoryOf(resource)}</span><span><FileText aria-hidden="true" />{resource.size}</span></p>
                {resource.description && <p className="hrr-card__desc">{resource.description}</p>}
                <div className="hrr-card__actions">
                  <button aria-label={`View ${resource.title}`} disabled={resource.id == null} onClick={() => view(resource)} className="hrr-btn hrr-btn--outline"><Eye />View</button>
                  <button aria-label={`Download ${resource.title}`} disabled={resource.id == null || downloading !== null} onClick={() => download(resource)} className="hrr-btn hrr-btn--navy"><Download />{downloading === resource.id ? 'Downloading...' : 'Download'}</button>
                </div>
              </div>
            </article>
          })}</div>}
    {(page > 1 || list.hasNext) && <div className="flex items-center justify-center gap-3"><button className={`${button} border bg-white text-slate-700`} disabled={page === 1 || list.loading} onClick={() => setPage(value => value - 1)}>Previous</button><span className="text-sm text-slate-500">Page {page}</span><button className={`${button} border bg-white text-slate-700`} disabled={!list.hasNext || list.loading || !!list.error} onClick={() => setPage(value => value + 1)}>Next</button></div>}
    <Modal open={previewOpen} onClose={closePreview} showClose={false} size="lg" bodyClassName="!p-0">
      {preview && <section role="dialog" aria-modal="true" aria-labelledby="resource-preview-title" className="text-slate-800 dark:text-slate-100">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-4 sm:p-5"><div className="min-w-0"><p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-600">Resource reader · {preview.resource.type}</p><h2 id="resource-preview-title" className="break-words text-lg font-bold">{preview.resource.title}</h2><p className="mt-1 text-sm text-slate-500">{preview.resource.course} · {preview.resource.size}</p></div><button ref={closeButton} className={`${button} border border-slate-200`} onClick={closePreview}>Close</button></header>
        {preview.resource.description && <p className="px-5 pt-4 text-sm text-slate-500">{preview.resource.description}</p>}
        <div className="min-h-64 max-h-[60vh] overflow-auto bg-slate-100 p-3 sm:p-5 dark:bg-slate-950">
          {preview.loading ? <p role="status" className="py-20 text-center text-sm">Loading preview...</p> : preview.error ? <div role="alert" className="rounded-lg border border-red-200 bg-white p-5 text-red-700"><p>{preview.error}</p><button className={`${button} mt-3 border`} onClick={() => view(preview.resource)}>Retry preview</button></div> : <ResourcePreview key={preview.resource.id} file={preview.file} />}
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4"><p className="text-xs text-slate-500">Download a copy to read offline.</p><button className={`${button} bg-[#133b5d] text-white`} disabled={downloading !== null} onClick={() => download(preview.resource)}><Download size={16} />{downloading === preview.resource.id ? 'Downloading...' : 'Download file'}</button></footer>
      </section>}
    </Modal>
  </div>
}
