import { FileSpreadsheet, FileText } from 'lucide-react'
import { toast } from 'sonner'
import DataTable from '@shared/components/DataTable'
import Button from '@shared/components/Button'
import { exportCSV, exportPDF } from '@features/hr/components/hrExport'

/**
 * HRDataTable — enterprise table for the HRMS, built on the shared DataTable
 * (search / sort / pagination / sticky header) plus:
 *  • always-available Export Excel (CSV) and Export PDF (jsPDF) toolbar
 *  • optional custom toolbar filters rendered above the table
 *
 * UI cleanup — row selection (checkboxes, select-all, bulk action toolbar) has
 * been removed across the whole HR module. The Export buttons, which previously
 * only appeared inside the selection toolbar, now render persistently (gated by
 * the `exportable` RBAC prop) so export capability is unchanged.
 */
export default function HRDataTable({
  columns,
  data,
  pageSize = 8,
  searchable = true,
  searchPlaceholder = 'Search…',
  onRowClick,
  filters,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
  exportFileName = 'hr-export',
  exportTitle = 'HR Export',
  stickyHeader = true,
  loading = false,
  resizable = false,
  // RBAC — when false, the built-in Export Excel / Export PDF buttons are hidden.
  exportable = true,
}) {
  const rowsToExport = data
  const headers = columns.map((col) => col.header)
  const exportRows = rowsToExport.map((row) => columns.map((col) => row[col.accessor]))

  const handleExcel = () => {
    exportCSV({ filename: exportFileName, headers, rows: exportRows })
    toast.success(`Exported ${rowsToExport.length} ${rowsToExport.length === 1 ? 'record' : 'records'} to Excel (CSV)`)
  }

  const handlePdf = () => {
    exportPDF({ filename: exportFileName, title: exportTitle, headers, rows: exportRows, subtitle: `${rowsToExport.length} records · Kini HRMS` })
    toast.success(`Exported ${rowsToExport.length} records to PDF`)
  }

  return (
    <div className="space-y-2">
      {/* Persistent export toolbar (RBAC-gated) */}
      {exportable && (
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Button variant="secondary" size="xs" icon={FileSpreadsheet} onClick={handleExcel}>Export Excel</Button>
          <Button variant="secondary" size="xs" icon={FileText} onClick={handlePdf}>Export PDF</Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data}
        pageSize={pageSize}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        onRowClick={onRowClick}
        filters={filters}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyIcon={emptyIcon}
        emptyAction={emptyAction}
        stickyHeader={stickyHeader}
        loading={loading}
        resizable={resizable}
      />
    </div>
  )
}
