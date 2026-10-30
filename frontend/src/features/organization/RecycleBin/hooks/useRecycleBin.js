import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { recycleBinService } from '../services/recycleBinService'
import {
  normalizeRecycleBinList,
  RECYCLE_BIN_TABS,
  RECYCLE_BIN_STATS,
} from '../utils/normalizeRecycleBinItem'

const createTabState = () => ({
  items: [],
  loaded: false,
  loading: false,
  refreshing: false,
  error: '',
})

const createInitialState = () => (
  RECYCLE_BIN_TABS.reduce((acc, tab) => {
    acc[tab] = createTabState()
    return acc
  }, {})
)

const clampPage = (page, totalPages) => {
  const safeTotal = Math.max(1, Number(totalPages) || 1)
  return Math.min(Math.max(1, Number(page) || 1), safeTotal)
}

export default function useRecycleBin() {
  const [activeTab, setActiveTab] = useState('students')
  const [tabState, setTabState] = useState(createInitialState)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [restoreTarget, setRestoreTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const deferredSearch = useDeferredValue(search)
  const tabsRef = useRef(tabState)
  const inFlightRef = useRef({})

  useEffect(() => {
    tabsRef.current = tabState
  }, [tabState])

  const updateTabState = useCallback((tab, updater) => {
    setTabState((current) => {
      const previous = current[tab] || createTabState()
      const nextState = typeof updater === 'function' ? updater(previous) : updater
      return {
        ...current,
        [tab]: nextState,
      }
    })
  }, [])

  const loadTab = useCallback(async (tab, { force = false } = {}) => {
    const current = tabsRef.current[tab] || createTabState()

    if (inFlightRef.current[tab]) {
      return inFlightRef.current[tab]
    }

    if (current.loaded && !force) {
      return current.items
    }

    updateTabState(tab, (previous) => ({
      ...previous,
      loading: !previous.loaded && !force,
      refreshing: force && previous.loaded,
      error: '',
    }))

    const request = recycleBinService.list(tab)
      .then((rows) => {
        const normalized = normalizeRecycleBinList(tab, rows)
        if (import.meta.env.DEV && normalized.length) {
          const sample = normalized[0]
          console.debug('Recycle Record:', sample)
          console.debug('Deleted Date:', sample.deletedAt)
          console.debug('Deleted By:', sample.deletedBy)
        }
        updateTabState(tab, (previous) => ({
          ...previous,
          items: normalized,
          loaded: true,
          loading: false,
          refreshing: false,
          error: '',
        }))
        return normalized
      })
      .catch((error) => {
        const message = error?.message || 'Failed to load recycle bin.'
        updateTabState(tab, (previous) => ({
          ...previous,
          loading: false,
          refreshing: false,
          error: message,
        }))
        throw error
      })
      .finally(() => {
        delete inFlightRef.current[tab]
      })

    inFlightRef.current[tab] = request
    return request
  }, [updateTabState])

  useEffect(() => {
    loadTab(activeTab).catch(() => {})
  }, [activeTab, loadTab])

  const activeState = tabState[activeTab] || createTabState()
  const searchQuery = deferredSearch.trim().toLowerCase()

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return activeState.items
    return activeState.items.filter((record) => String(record.searchIndex || '').includes(searchQuery))
  }, [activeState.items, searchQuery])

  const totalItems = filteredRecords.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = clampPage(page, totalPages)

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage)
    }
  }, [currentPage, page])

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRecords.slice(start, start + pageSize)
  }, [currentPage, filteredRecords, pageSize])

  const stats = useMemo(() => (
    RECYCLE_BIN_TABS.map((tab) => ({
      key: tab,
      label: RECYCLE_BIN_STATS[tab].label,
      value: tabState[tab]?.loaded ? tabState[tab].items.length : null,
      loaded: tabState[tab]?.loaded ?? false,
      loading: tabState[tab]?.loading || tabState[tab]?.refreshing || false,
    }))
  ), [tabState])

  const refreshActiveTab = useCallback(() => {
    loadTab(activeTab, { force: true }).catch(() => {})
  }, [activeTab, loadTab])

  const removeFromCache = useCallback((entity, id) => {
    updateTabState(entity, (previous) => ({
      ...previous,
      items: previous.items.filter((item) => String(item.id) !== String(id)),
    }))
  }, [updateTabState])

  const restoreRecord = useCallback(async () => {
    if (!restoreTarget) return

    const { entity, id } = restoreTarget
    const snapshot = tabsRef.current[entity]?.items || []
    setActionLoading(true)
    setRestoreTarget(null)
    removeFromCache(entity, id)

    try {
      await recycleBinService.restore(entity, id)
      toast.success('Record restored successfully.')
    } catch (error) {
      updateTabState(entity, (previous) => ({
        ...previous,
        items: snapshot,
      }))
      toast.error('Unable to complete the requested action.')
    } finally {
      setActionLoading(false)
    }
  }, [removeFromCache, restoreTarget, updateTabState])

  const deleteRecord = useCallback(async () => {
    if (!deleteTarget) return

    const { entity, id } = deleteTarget
    const snapshot = tabsRef.current[entity]?.items || []
    setActionLoading(true)
    setDeleteTarget(null)
    removeFromCache(entity, id)

    try {
      await recycleBinService.permanentDelete(entity, id)
      toast.success('Record permanently deleted.')
    } catch (error) {
      updateTabState(entity, (previous) => ({
        ...previous,
        items: snapshot,
      }))
      toast.error('Unable to complete the requested action.')
    } finally {
      setActionLoading(false)
    }
  }, [deleteTarget, removeFromCache, updateTabState])

  const openRestoreModal = useCallback((record) => {
    setRestoreTarget(record)
    setDeleteTarget(null)
  }, [])

  const openDeleteModal = useCallback((record) => {
    setDeleteTarget(record)
    setRestoreTarget(null)
  }, [])

  const closeModals = useCallback(() => {
    setRestoreTarget(null)
    setDeleteTarget(null)
  }, [])

  const changeTab = useCallback((tab) => {
    setActiveTab(tab)
    setPage(1)
  }, [])

  const changePageSize = useCallback((size) => {
    setPageSize(size)
    setPage(1)
  }, [])

  return {
    activeTab,
    activeState,
    actionLoading,
    changePageSize,
    changeTab,
    closeModals,
    currentPage,
    deleteRecord,
    deleteTarget,
    filteredRecords,
    isRefreshing: Boolean(activeState.refreshing),
    loadTab,
    openDeleteModal,
    openRestoreModal,
    page,
    pageItems,
    pageSize,
    refreshActiveTab,
    restoreRecord,
    restoreTarget,
    search,
    setPage,
    setSearch,
    stats,
    tabState,
    totalItems,
    totalPages,
  }
}
