import { jsPDF } from 'jspdf'

/**
 * CSV/PDF export helpers shared by HRDataTable and HR action menus.
 * Uses the same Blob + objectURL pattern as the rest of the codebase.
 */

const escapeCell = (value) => {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function exportCSV({ filename = 'export', headers = [], rows = [] }) {
  const csv = [headers.map(escapeCell).join(','), ...rows.map((row) => row.map(escapeCell).join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function buildPdfDoc({ title = 'Export', headers = [], rows = [], subtitle = '' }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 40

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(15, 85, 247)
  doc.text(title, margin, 48)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text(subtitle || `${rows.length} records`, margin, 64)

  const colWidth = (pageWidth - margin * 2) / Math.max(headers.length, 1)
  let y = 88

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.setFillColor(15, 85, 247)
  headers.forEach((header, i) => {
    doc.rect(margin + i * colWidth, y - 12, colWidth, 20, 'F')
    doc.text(String(header).slice(0, 24), margin + i * colWidth + 6, y + 2)
  })
  y += 20

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 65, 85)
  rows.forEach((row) => {
    if (y > doc.internal.pageSize.getHeight() - 50) {
      doc.addPage()
      y = 50
    }
    doc.setFillColor(248, 250, 252)
    doc.rect(margin, y - 10, pageWidth - margin * 2, 18, 'F')
    row.forEach((cell, i) => {
      doc.text(String(cell ?? '').slice(0, 30), margin + i * colWidth + 6, y + 2)
    })
    y += 18
  })

  return doc
}

export function exportPDF({ filename = 'export', title = 'Export', headers = [], rows = [], subtitle = '' }) {
  const doc = buildPdfDoc({ title, headers, rows, subtitle })
  doc.save(`${filename}.pdf`)
}

/**
 * printPDF — builds the same branded PDF and opens it in a new tab with the
 * print dialog ready (functional Print action for payslips / reports).
 */
export function printPDF({ title = 'Export', headers = [], rows = [], subtitle = '' }) {
  const doc = buildPdfDoc({ title, headers, rows, subtitle })
  doc.autoPrint()
  doc.output('dataurlnewwindow')
}
