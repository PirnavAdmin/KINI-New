import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Search, Trash2 } from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import { Button, Input } from '@shared/components/FormElements'
import RecycleBinStats from './RecycleBinStats'
import RecycleBinTabs from './RecycleBinTabs'
import RecycleBinTable from './RecycleBinTable'
import EmptyState from './EmptyState'
import ErrorState from './ErrorState'
import RestoreModal from './RestoreModal'
import PermanentDeleteModal from './PermanentDeleteModal'
import useRecycleBin from './hooks/useRecycleBin'
import { RECYCLE_BIN_TAB_META, RECYCLE_BIN_TABS } from './utils/normalizeRecycleBinItem'

export default function RecycleBinPage() {
  const {
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
    isRefreshing,
    openDeleteModal,
    openRestoreModal,
    pageItems,
    pageSize,
    refreshActiveTab,
    restoreRecord,
    restoreTarget,
    search,
    setPage,
    setSearch,
    stats,
    totalItems,
    totalPages,
  } = useRecycleBin()

  const activeTabMeta = RECYCLE_BIN_TAB_META[activeTab] || RECYCLE_BIN_TAB_META.students

  const pageState = useMemo(() => ({
    loading: activeState.loading,
    refreshing: activeState.refreshing,
    error: activeState.error,
  }), [activeState.error, activeState.loading, activeState.refreshing])

  const isEmpty = !pageState.loading && !pageState.error && filteredRecords.length === 0
  const hasTableRows = pageItems.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="w-full min-w-0 px-1 pb-6 pt-0 sm:px-1.5"
    >
      <PageHeader
        compact
        title="Recycle Bin"
        subtitle="Restore or permanently delete previously removed records."
        icon={Trash2}
        actions={(
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:w-[320px] lg:w-[380px]">
              <Input
                value={search}
                onChange={(event) => {
                  setPage(1)
                  setSearch(event.target.value)
                }}
                placeholder={`Search ${activeTabMeta.label.toLowerCase()} by name, email, or role...`}
                icon={Search}
              />
            </div>
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={pageState.loading || isRefreshing || actionLoading}
              onClick={refreshActiveTab}
            >
              Refresh
            </Button>
          </div>
        )}
      />

      <div className="-mt-3">
        <RecycleBinStats stats={stats} />
      </div>

      <div className="mt-3 space-y-3">
        <RecycleBinTabs
          tabs={RECYCLE_BIN_TABS.map((tab) => ({
            key: tab,
            label: RECYCLE_BIN_TAB_META[tab].label,
            count: stats.find((entry) => entry.key === tab)?.value ?? null,
          }))}
          activeTab={activeTab}
          onChange={changeTab}
        />

        {pageState.error && !pageState.loading ? (
          <ErrorState
            message={pageState.error}
            onRetry={refreshActiveTab}
            retrying={isRefreshing || actionLoading}
          />
        ) : pageState.loading ? (
          <RecycleBinTable
            loading
            records={[]}
            refreshing={false}
            page={currentPage}
            pageSize={pageSize}
            totalItems={0}
            totalPages={1}
            onPageChange={setPage}
            onPageSizeChange={changePageSize}
          />
        ) : isEmpty ? (
          <EmptyState onRefresh={refreshActiveTab} refreshing={isRefreshing || actionLoading} />
        ) : hasTableRows ? (
          <RecycleBinTable
            records={pageItems}
            loading={false}
            refreshing={isRefreshing}
            actionsDisabled={actionLoading}
            page={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={changePageSize}
            onRestore={openRestoreModal}
            onPermanentDelete={openDeleteModal}
          />
        ) : null}
      </div>

      <RestoreModal
        open={Boolean(restoreTarget)}
        loading={actionLoading}
        onClose={closeModals}
        onConfirm={restoreRecord}
      />

      <PermanentDeleteModal
        open={Boolean(deleteTarget)}
        loading={actionLoading}
        onClose={closeModals}
        onConfirm={deleteRecord}
      />
    </motion.div>
  )
}
