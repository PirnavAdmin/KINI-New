import Modal from '@shared/components/Modal'
import { Button } from '@shared/components/FormElements'

export default function RestoreModal({ open, loading, onClose, onConfirm }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Restore Record?"
      description="This record will be restored and become active again."
      size="sm"
      footer={(
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} loading={loading}>
            Restore
          </Button>
        </div>
      )}
    >
      <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
        Do you want to continue?
      </p>
    </Modal>
  )
}
