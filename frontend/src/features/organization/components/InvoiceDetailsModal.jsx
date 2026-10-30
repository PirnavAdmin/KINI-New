import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import Modal from '@shared/components/Modal';
import InvoiceDetailsContent from './InvoiceDetailsContent';
import './invoice-details.css';

export default function InvoiceDetailsModal({ invoice, open, onClose, onDownload }) {
  const [downloading, setDownloading] = useState(false);
  if (!invoice) return null;
  const download = async () => {
    setDownloading(true);
    try { await onDownload(invoice); } finally { setDownloading(false); }
  };
  return <Modal open={open} onClose={onClose} title="Invoice Details"
    description="Review billing information and download the final invoice."
    size="lg" className="invoice-details-modal" bodyClassName="!p-0"
    footer={<button type="button" className="invoice-download" disabled={downloading} onClick={download}>
      {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {downloading ? 'Downloading…' : 'Download PDF'}
    </button>}>
    <InvoiceDetailsContent invoice={invoice} />
  </Modal>;
}
